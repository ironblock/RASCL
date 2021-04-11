import {
  call,
  put,
  takeLatest,
  StrictEffect,
  all,
  spawn,
  ForkEffect,
  AllEffect,
} from "redux-saga/effects";

import ky from "ky";
import { APICallNoParams, APICallWithParams, APIFunctionMap, GenericAPICall } from "./types/API";
import { ActionCreatorsMap, RequestAction } from "./actions";
import { RequestType } from "./constants";
import { AsyncReturnType } from "type-fest";

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
export function* kyPublicRequestSaga<K extends string & keyof M, M extends APIFunctionMap>(
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
        yield put(actionCreators.offline(error));
      } else {
        // Unknown Error
        yield put(actionCreators.mistake(unknownError));
      }
    } else if (error instanceof ky.TimeoutError) {
      // Timeout Error
      yield put(actionCreators.timeout(error));
    } else if (error instanceof Error) {
      // Generic Error
      yield put(actionCreators.mistake(error));
    } else {
      // Unknown Error
      yield put(actionCreators.mistake(unknownError));
    }
  }
}

export function* kyPrivateRequestSaga() {}

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
            console.error(`The RASCAL API Saga for "${name}" encountered an uncaught error:`);
            console.error(error);
          }
        }
      }),
    ),
  );
}
