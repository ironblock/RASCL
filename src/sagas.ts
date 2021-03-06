import { HTTPError as KyHTTPError, TimeoutError as KyTimeoutError } from "ky";
import type { Action } from "redux";
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
  Effect,
} from "redux-saga/effects";
import { AsyncReturnType } from "type-fest";
import { Prepend, First } from "typescript-tuple";

import {
  ActionCreatorsMap,
  doesNotUseParams,
  EnqueueAction,
  RequestAction,
  RequestParameters,
} from "./actions";
import { EnqueueType, RequestType } from "./constants";
import {
  APICallNoParams,
  APICallWithAuthentication,
  APICallWithParams,
  APIFunctionMap,
  APIFunctionMapWithAuthentication,
} from "./types/API";

const unknownError = new Error("An error of an unknown type occurred");

export type WatcherSaga<K extends string & keyof M, M extends APIFunctionMap> = (
  request: M[K],
  actionCreators: ActionCreatorsMap<M>[K],
  ...params: any
) => Generator<Effect<EnqueueType<K> | RequestType<K>>, void, any>;
export type WatcherSagaMap<M extends APIFunctionMap> = {
  [K in string & keyof M]: WatcherSaga<K, M>;
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
    const response = yield doesNotUseParams(request, payload)
      ? call<APICallNoParams>(request)
      : call<APICallWithParams | APICallWithAuthentication>(request, ...payload);

    yield put(actionCreators.success(response));
  } catch (error) {
    if (error instanceof KyHTTPError) {
      const { status } = error?.response;

      if (status >= 500) {
        // Server Error
        yield put(actionCreators.failure(error));
      } else if (status >= 400) {
        // Client Error
        yield put(actionCreators.mistake(error));
      } else if (typeof status === "undefined" || status === 0 || !navigator?.onLine) {
        // Offline Error
        yield put(actionCreators.offline(error));
      } else {
        // Unknown Error (Treated as Client Error)
        yield put(actionCreators.mistake(unknownError));
      }
    } else if (error instanceof KyTimeoutError) {
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
  K extends string & keyof M,
  M extends APIFunctionMapWithAuthentication
>(
  request: M[K],
  actionCreators: ActionCreatorsMap<M>[K],
  { payload }: EnqueueAction<K, M>,
  pattern: ActionPattern<Action<any>>,
  getAuthentication: () => First<Parameters<M[K]>>,
): Generator<ForkEffect<unknown>, void, First<Parameters<M[K]>>> {
  const authentication: First<Parameters<M[K]>> = yield fork(
    requireAuth,
    pattern,
    getAuthentication,
  );
  const authorizedPayload: Prepend<typeof payload, typeof authentication> &
    RequestParameters<K, M> = [authentication, ...(payload ?? [])];
  const authorizedRequest = actionCreators.request(authorizedPayload);

  yield fork(kyRequestSaga, request, actionCreators, authorizedRequest);
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

  while (typeof authentication === "undefined" || authentication === null) {
    yield take(pattern);
    authentication = yield select(getAuthentication);
  }

  return authentication;
}

export const createWatcherSaga = <K extends string & keyof M, M extends APIFunctionMap>(
  requestType: RequestType<K>,
  requestSaga: WatcherSaga<K, M>,
  request: M[K],
  actionCreators: ActionCreatorsMap<M>[K],
  ...args: any
): (() => Generator<StrictEffect, void, void>) =>
  function* watcherSaga() {
    yield takeLatest(requestType, requestSaga, request, actionCreators, ...args);
  };

export const createRootSaga = <M extends APIFunctionMap>(
  sagas: WatcherSagaMap<M>,
): (() => Generator<AllEffect<ForkEffect<void>>, void, unknown>) =>
  function* rootSaga() {
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
  };
