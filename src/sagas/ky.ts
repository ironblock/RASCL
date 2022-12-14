import { HTTPError as KyHTTPError, TimeoutError as KyTimeoutError } from "ky";
import type { Action } from "redux";
import type { SagaIterator } from "redux-saga";
import type { ActionPattern } from "redux-saga/effects";
import { put, fork, call } from "redux-saga/effects";
import type { First, Prepend } from "typescript-tuple";

import { requireAuth } from ".";
import type { ActionCreatorsMap, RequestAction, EnqueueAction } from "../actions";
import { doesNotUseParams } from "../actions";
import { MistakeError } from "../errors";
import type {
  APIFunctionMap,
  APICallNoParams,
  APICallWithParams,
  APICallWithAuthentication,
  APIFunctionMapWithAuthentication,
  RequestParameters,
} from "../types/API";
import type { AuthenticationSelector } from "../types/sagas";

/**
 * PUBLIC ENDPOINT (KY)
 *
 * A standard API request made to an open (non-authenticated) endpoint.
 *
 * @param requestMethod
 * @param action
 *: Generator<Effect<any, any>, void, PromiseValue<ReturnType<M[K]>, ReturnType<M[K]>>>
 */
export function* kyRequestSaga<K extends string & keyof M, M extends APIFunctionMap>(
  request: M[K],
  actionCreators: ActionCreatorsMap<M>[K],
  { payload }: RequestAction<K, M>,
): SagaIterator<void> {
  try {
    const response: ReturnType<M[K]> = yield doesNotUseParams(request, payload)
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
        yield put(
          actionCreators.mistake(
            new MistakeError(error?.response, error?.message || "Unknown error"),
          ),
        );
      }
    } else if (error instanceof KyTimeoutError) {
      // Timeout Error
      yield put(actionCreators.timeout(error));
    } else if (error instanceof Error) {
      // Generic Error (Treated as Client Error)
      yield put(actionCreators.mistake(error));
    } else {
      // Unknown Error (Treated as Client Error)
      yield put(actionCreators.mistake(new MistakeError(null, "An unknown error ocurred")));
    }
  }
}

export function* kyPrivateRequestSaga<
  K extends string & keyof M,
  M extends APIFunctionMap & APIFunctionMapWithAuthentication,
>(
  request: M[K] & APICallWithAuthentication,
  actionCreators: ActionCreatorsMap<M>[K],
  { payload }: EnqueueAction<K, M>,
  pattern: ActionPattern<Action<any>>,
  getAuthentication: AuthenticationSelector<First<Parameters<M[K]>>>,
): SagaIterator<void> {
  const authentication = yield fork(requireAuth, pattern, getAuthentication);
  const authorizedPayload: Prepend<typeof payload, typeof authentication> &
    RequestParameters<K, M> = [authentication, ...(payload ?? [])];
  const authorizedRequest = actionCreators.request(authorizedPayload);

  /**
   * TODO: This shouldn't be typed as fork<any>, but it's fiendishly difficult
   * to provide the correct typing. TypeScript seems to correctly infer the
   * actual internal types of each parameter, so hopefully this is just missing
   * some narrowing and not actually introducting an overly permissive type.
   */
  yield fork<any>(kyRequestSaga, request, actionCreators, authorizedRequest);
}
