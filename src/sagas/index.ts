import type { Action } from "redux";
import { all, call, select, spawn, take, takeLatest } from "redux-saga/effects";
import type {
  AllEffect,
  StrictEffect,
  ActionPattern,
  ForkEffect,
  SelectEffect,
  TakeEffect,
  Effect,
} from "redux-saga/effects";

import type { ActionCreatorsMap } from "../actions";
import type { EnqueueType, RequestType } from "../constants";
import type { APIFunctionMap } from "../types/API";

export const unknownError = new Error("An error of an unknown type occurred");

export type WatcherSaga<K extends string & keyof M, M extends APIFunctionMap> = (
  request: M[K],
  actionCreators: ActionCreatorsMap<M>[K],
  ...params: any
) => Generator<Effect<EnqueueType<K> | RequestType<K>>, void, any>;
export type WatcherSagaMap<M extends APIFunctionMap> = {
  [K in string & keyof M]: WatcherSaga<K, M>;
};

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
