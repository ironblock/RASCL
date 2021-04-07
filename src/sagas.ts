import {
  call,
  put,
  takeLatest,
  all,
  spawn,
  StrictEffect,
  CallEffect,
  SagaReturnType,
  ForkEffect,
} from "redux-saga/effects";

import ky from "ky";
import { APICallNoParams, APICallWithParams, APIFunctionMap, GenericAPICall } from "./types/API";
import { FSA } from "./types/FSA";
import { ActionCreatorsMap, RequestAction } from "./actions";
import { RequestType } from "./constants";

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
export function* kyPublicRequestSaga<S extends string & keyof M, M extends APIFunctionMap>(
  request: M[S],
  actionCreators: ActionCreatorsMap<M>[S],
  { payload }: RequestAction<S, M>,
): Generator<StrictEffect, void, ReturnType<M[S]>> {
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
      } else if (typeof error.response === "undefined") {
        // Offline Error
        // Not well documented, but Ky will return `undefined` for the `response`
        // property when the network is offline or the host is unreachable.
        yield put(actionCreators.offline(error));
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
