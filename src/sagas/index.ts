import type { Action } from "redux";
import type { SagaIterator } from "redux-saga";
import { all, call, select, spawn, take, takeLatest } from "redux-saga/effects";
import type { ActionPattern } from "redux-saga/effects";

import type { ActionCreatorsMap } from "../actions";
import type { EnqueueType, RequestType } from "../constants";
import type { APIFunctionMap } from "../types/API";
import type { AuthenticationSelector } from "../types/sagas";

/**
 * NOTE: These sagas don't handle a number of more specific cases, like "access
 * denied" or "request timed out". A comprehensive implementation of RASCL
 * involves either composing the more basic sagas provided by RASCL, or writing
 * custom sagas to handle the particulars of a given API implementation.
 */

export type EndpointWatcherSaga<K extends string & keyof M, M extends APIFunctionMap> = (
  request: M[K],
  actionCreators: ActionCreatorsMap<M>[K],
  ...params: any
) => SagaIterator<void>;

export type WatcherSagaMap<M extends APIFunctionMap> = {
  [K in string & keyof M]: EndpointWatcherSaga<K, M>;
};

/**
 *
 * @param pattern A pattern compatible with Redux's `take()` effect. Should
 * match any actions that may cause the authentication selector to return valid
 * credentials.
 *
 * @param getAuthentication A selector to be called with Redux's `select()`
 * effect. Should return authentication credentials when available.
 *
 * @returns authentication Authentication credentials in whichever shape your
 * API calls require them. Can be explicitly typed using `requireAuth`'s `A`
 * generic, which can then be passed to any API calling function that requires
 * that form of authentication.
 */
export function* requireAuth<A extends unknown>(
  pattern: ActionPattern<Action<any>>,
  getAuthentication: AuthenticationSelector<A>,
): SagaIterator<A> {
  let authentication: A = yield select(getAuthentication);

  while (typeof authentication === "undefined" || authentication === null) {
    yield take(pattern);
    authentication = yield select(getAuthentication);
  }

  return authentication;
}

export const createWatcherSaga = <K extends string & keyof M, M extends APIFunctionMap>(
  requestType: EnqueueType<K> | RequestType<K>,
  requestSaga: EndpointWatcherSaga<K, M>,
  request: M[K],
  actionCreators: ActionCreatorsMap<M>[K],
  ...args: any
): (() => SagaIterator<void>) =>
  function* watcherSaga() {
    yield takeLatest(requestType, requestSaga, request, actionCreators, ...args);
  };

/**
 * createRootSaga is a foundational element of RASCL. It provides handlers for all
 * the lifecycle events of an API call.
 * @param sagas A map of saga functions
 * @returns rootSaga A SagaIterator function that can be used as a root saga.
 */
export const createRootSaga = <M extends APIFunctionMap>(
  sagas: WatcherSagaMap<M>,
): (() => SagaIterator<void>) =>
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
