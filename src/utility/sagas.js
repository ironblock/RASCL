// @flow
import type { Pattern, Saga, PutEffect } from "redux-saga";
import { call, put, takeLatest, all, spawn } from "redux-saga/effects";
import to from "to-case";

import type { ApiActions } from "./actions";

type KyError = {
  name: string,
  response: Response
};

export type WatcherSagaMap = { [name: string]: () => Saga<void> };

/**
 * Ky throws specially constructed errors that correspond to the specific HTTP
 * error, and sometimes indicate a particular failure mode. This function
 * intends to map those opinionated values onto our API state caching model.
 *
 * @param {*} error An extended instance of Error specific to Ky
 */
const classifyKyError = (error: KyError): EndpointState => {
  const { name, response } = error;

  if (name === "TimeoutError") {
    return "timeout";
  } else if (response && response.status) {
    if (response.status >= 400) {
      if (response.status >= 500) {
        return "failure";
      }
      return "mistake";
    }
  }

  return "mistake";
};

export const extractErrorDetails = (
  error: Error = new Error("An unknown error ocurred")
) => ({
  name: error.name,
  message: error.message
});

export const nameWatcherSaga = (endpoint: string) =>
  `watch${to.pascal(endpoint)}Saga`;

export type SagaConfig = {
  api: *,
  actionCreators: ApiActions,
  endpoint: string,
  requireAuth?: Function
};

/**
 * API CALL SAGAS
 *
 * Two mostly similar sagas used to make API calls. These can be considered
 * example workflows for "I want to make an unprotected API call" and "I want
 * to make an API call which will require some kind of authentication". If
 * neither one fits your use case, it's fine to create something else.
 */

export const validateCall = ({ api, actionCreators, endpoint }: SagaConfig) => {
  if (!api) throw new ReferenceError("api must be defined");
  if (!endpoint) throw new ReferenceError("endpoint must be defined");
  if (!actionCreators)
    throw new ReferenceError("actionCreators must be defined");

  if (!api[endpoint])
    throw new ReferenceError(`endpoint "${endpoint} was not found in api`);
  if (!actionCreators[endpoint])
    throw new ReferenceError(
      `endpoint "${endpoint} was not found in actionCreators`
    );
};

export function* openEndpointCall(
  { api, actionCreators, endpoint }: SagaConfig,
  action: FSA<string, mixed>
): Generator<PutEffect<FSA<string, *>, null>, void, void> {
  try {
    validateCall({ api, actionCreators, endpoint });
    const response = yield call(api[endpoint], action.payload);

    yield put(actionCreators[endpoint].success(response));
  } catch (error) {
    yield put(
      actionCreators[endpoint][classifyKyError(error)](
        extractErrorDetails(error)
      )
    );
  }
}

export function* authorizedEndpointCall(
  { api, actionCreators, endpoint, requireAuth }: SagaConfig,
  action: FSA<string, mixed>
): Generator<PutEffect<FSA<string, *>, null>, void, void> {
  try {
    validateCall({ api, actionCreators, endpoint });
    if (typeof requireAuth !== "function") {
      throw new Error("Cannot make an authorized API call without requireAuth");
    }

    const token: string = yield* requireAuth();
    if (!token) {
      throw new TypeError("Token must be set to make authorized calls");
    }
    const response = yield call(api[endpoint], token, action.payload);
    yield put(actionCreators[endpoint].success(response));
  } catch (error) {
    yield put(
      actionCreators[endpoint][classifyKyError(error)](
        extractErrorDetails(error)
      )
    );
  }
}

/**
 * WATCHERS
 *
 * Convenience methods to dynamically call the API sagas above. Since the inputs
 * and outputs have the same shape by design, no boilerplate should ever be
 * required in the saga layer.
 */

export const generateSagas = function(
  handler: (
    config: SagaConfig,
    action: FSA<string, mixed>
  ) => Generator<*, *, *>,
  config: $Shape<SagaConfig>
): WatcherSagaMap {
  return Object.keys(config.api).reduce((map, endpoint) => {
    const boundHandler = handler.bind(this, { ...config, endpoint });

    map[nameWatcherSaga(endpoint)] = function*() {
      yield takeLatest(config.actionCreators[endpoint].request, boundHandler);
    };

    return map;
  }, {});
};

/**
 * Provides a convenient way to handle "if that then this" in a redux-saga
 * friendly way. Watches for a Pattern, then puts actions in response. This is
 * an easy way to handle use cases like "refresh data when a POST succeeds".
 * @param {Pattern} takePattern - Actions to watch for
 * @param {Pattern} actionToPut - Actions to dispatch in response
 */
export function respondWithAction(
  name: string,
  takePattern: Pattern,
  actionToPut: () => FSA<string, mixed> | Array<() => FSA<string, mixed>>
): WatcherSagaMap {
  return {
    *[nameWatcherSaga(`Stale${name}`)]() {
      yield takeLatest(takePattern, function* foo(): Generator<
        PutEffect<FSA<string, mixed>, null>,
        void,
        void
      > {
        if (!Array.isArray(actionToPut)) {
          for (let action of actionToPut) {
            yield put(action());
          }
        } else {
          yield put(actionToPut());
        }
      });
    }
  };
}

export const createRootSaga = (
  namespaces: WatcherSagaMap[]
): (() => Saga<void>) =>
  function* rootSaga() {
    yield all(
      namespaces
        .map(namespace =>
          Object.keys(namespace).map(watcher => spawn(namespace[watcher]))
        )
        .reduce((acc, watchers) => [...acc, ...watchers])
    );
  };
