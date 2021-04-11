import {
  ActionPattern,
  AllEffect,
  ForkEffect,
  StrictEffect,
  all,
  call,
  fork,
  put,
  select,
  spawn,
  take,
  takeLatest,
  SelectEffect,
  TakeEffect,
} from "redux-saga/effects";

import ky from "ky";
import { APICallNoParams, APICallWithParams, APIFunctionMap } from "./types/API";
import { ActionCreatorsMap, RequestAction } from "./actions";
import { RequestType } from "./constants";
import { AsyncReturnType } from "type-fest";
import { Action } from "redux";

const unknownError = new Error("An error of an unknown type occurred");

export type WatcherSagaMap<M extends APIFunctionMap> = {
  [K in string & keyof M]: () => Generator<StrictEffect, void, void>;
};

/**
 * PUBLIC ENDPOINT (KY)
 *
 * A standard API request made to an open (non-authenticated) endpoint.
 *
 * @param requestMethod
 * @param action
 */
export function* kyRequestSaga<K extends string & keyof M, M extends APIFunctionMap>(
  request: M[K],
  actionCreators: ActionCreatorsMap<M>[K],
  { payload }: RequestAction<K, M>,
): Generator<StrictEffect, void, AsyncReturnType<M[K]>> {
  try {
    const response = yield Array.isArray(payload)
      ? call<APICallWithParams>(request, ...payload)
      : call<APICallNoParams>(request);

    yield put(actionCreators.success(response));
  } catch (error) {
    if (error instanceof ky.HTTPError) {
      const { status } = error?.response;

      if (status >= 500) {
        // Server Error
        yield put(actionCreators.failure(error));
      } else if (status >= 400) {
        // Client Error
        yield put(actionCreators.mistake(error));
      } else if (typeof status === "undefined" || status === 0 || navigator?.onLine === false) {
        // Offline Error
        yield put(actionCreators.offline(error));
      } else {
        // Unknown Error (Treated as Client Error)
        yield put(actionCreators.mistake(unknownError));
      }
    } else if (error instanceof ky.TimeoutError) {
      // Timeout Error
      yield put(actionCreators.timeout(error));
    } else if (error instanceof Error) {
      // Generic Error (Treated as Client Error)
      yield put(actionCreators.mistake(error));
    } else {
      // Unknown Error (Treated as Client Error)
      yield put(actionCreators.mistake(unknownError));
    }
  }
}

export function* kyPrivateRequestSaga<
  A extends unknown,
  K extends string & keyof M,
  M extends APIFunctionMap
>(
  pattern: ActionPattern<Action<any>>,
  getAuthentication: () => A,
  request: M[K],
  actionCreators: ActionCreatorsMap<M>[K],
  action: RequestAction<K, M>,
) {
  const authentication: A = yield fork(requireAuth, pattern, getAuthentication);
  const authorizedAction: RequestAction<K, M> = {
    ...action,
    payload: [authentication, ...action.payload],
  };

  yield fork(kyRequestSaga, request, actionCreators, authorizedAction);
}

/**
 *
 * @param pattern A pattern compatible with Redux's `take()` effect. Should
 * match any actions that may cause the authentication selector to return valid
 * credentials.
 * @param getAuthentication A selector to be called with Redux's `select()`
 * effect. Should return authentication credentials when available.
 * @returns authentication Authentication credentials in whichever shape your
 * API calls require them. Can be explicitly typed using `requireAuth`'s `A`
 * generic.
 */
export function* requireAuth<A extends unknown>(
  pattern: ActionPattern<Action<any>>,
  getAuthentication: () => A,
): Generator<SelectEffect | TakeEffect, A, A> {
  let authentication: A = yield select(getAuthentication);

  while (!authentication) {
    yield take(pattern);
    authentication = yield select(getAuthentication);
  }

  return authentication;
}

export const createWatcherSaga = <S extends string & keyof M, M extends APIFunctionMap>(
  requestSaga: any,
  requestType: RequestType<S>,
  request: M[S],
  actionCreators: ActionCreatorsMap<M>[S],
): (() => Generator<StrictEffect, void, void>) =>
  function* watcherSaga() {
    yield takeLatest(requestType, requestSaga, request, actionCreators);
  };

export function* createRootSaga<M extends APIFunctionMap>(
  sagas: WatcherSagaMap<M>,
): Generator<AllEffect<ForkEffect<void>>, void, unknown> {
  yield all(
    Object.entries(sagas).map(([name, saga]) =>
      spawn(function* () {
        while (true) {
          try {
            yield call(saga);
            break;
          } catch (error) {
            console.error(`The RASCAL Saga for "${name}" encountered an uncaught error:`);
            console.error(error);
          }
        }
      }),
    ),
  );
}
