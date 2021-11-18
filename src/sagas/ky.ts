import { HTTPError as KyHTTPError, TimeoutError as KyTimeoutError } from "ky";
import type { Action } from "redux";
import type { StrictEffect, ActionPattern, ForkEffect } from "redux-saga/effects";
import { put, fork, call } from "redux-saga/effects";
import type { AsyncReturnType } from "type-fest";
import type { First, Prepend } from "typescript-tuple";

import { requireAuth, unknownError } from ".";
import type {
  ActionCreatorsMap,
  RequestAction,
  EnqueueAction,
  RequestParameters,
} from "../actions";
import { doesNotUseParams } from "../actions";
import type {
  APIFunctionMap,
  APICallNoParams,
  APICallWithParams,
  APICallWithAuthentication,
  APIFunctionMapWithAuthentication,
} from "../types/API";

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
  M extends APIFunctionMapWithAuthentication,
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
