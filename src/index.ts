import type { ActionCreatorsMap } from "./actions";
import { createActions } from "./actions";
import type { ActionTypeConstantsMap } from "./constants";
import { createTypeConstants } from "./constants";
import type { APIHandlerMap, APIReducer, APIReducerState } from "./reducers";
import {
  handleEnqueue,
  createReducer,
  handleFailure,
  handleMistake,
  handleOffline,
  handleRequest,
  handleSuccess,
  handleTimeout,
  initialEndpointState,
} from "./reducers";
import type { EndpointWatcherSaga, WatcherSagaMap } from "./sagas";
import { createRootSaga, createWatcherSaga } from "./sagas";
import { automaticFetchEnqueue, automaticFetchRequest } from "./sagas/fetch";
import type { APIFunctionMap } from "./types/API";

export interface RASCL<M extends APIFunctionMap> {
  types: ActionTypeConstantsMap<M>;
  actions: ActionCreatorsMap<M>;
  initialState: APIReducerState<M>;
  handlers: APIHandlerMap<M>;
  watchers: WatcherSagaMap<M>;
  reducer: APIReducer<M>;
  rootSaga: ReturnType<typeof createRootSaga>;
}

export interface Options<M extends APIFunctionMap> {
  enqueueWatcher: EndpointWatcherSaga<keyof M & string, M>;
  requestWatcher: EndpointWatcherSaga<keyof M & string, M>;
  enqueueEndpoints: Set<keyof M & string>;
  customWatchers: { [k in keyof M]: EndpointWatcherSaga<keyof M & string, M> };
}

export const defaultOptions: Options<any> = {
  enqueueWatcher: automaticFetchEnqueue,
  requestWatcher: automaticFetchRequest,
  enqueueEndpoints: new Set(),
  customWatchers: {},
};

export const createRASCL = <M extends APIFunctionMap>(
  functions: M,
  options?: Options<M>,
): RASCL<M> => {
  const selectedOptions = { ...defaultOptions, ...options };
  const names: Array<keyof M & string> = Object.keys(functions);

  const types: Partial<RASCL<M>["types"]> = {};
  const actions: Partial<RASCL<M>["actions"]> = {};
  const initialState: Partial<RASCL<M>["initialState"]> = {};
  const handlers: Partial<RASCL<M>["handlers"]> = {};
  const watchers: Partial<RASCL<M>["watchers"]> = {};

  for (const name of names) {
    const typeConstants = createTypeConstants<M, typeof name>(name);

    // TYPE CONSTANTS
    types[name] = typeConstants;

    // ACTION CREATORS
    actions[name] = createActions<M, typeof name>(typeConstants);

    // REDUCER INITIAL STATE
    initialState[name] = initialEndpointState;

    // REDUCER ACTION HANDLERS
    handlers[typeConstants.enqueue] = (draft, action) => handleEnqueue(name, draft, action);
    handlers[typeConstants.request] = (draft, action) => handleRequest(name, draft, action);
    handlers[typeConstants.success] = (draft, action) => handleSuccess(name, draft, action);
    handlers[typeConstants.failure] = (draft, action) => handleFailure(name, draft, action);
    handlers[typeConstants.mistake] = (draft, action) => handleMistake(name, draft, action);
    handlers[typeConstants.timeout] = (draft, action) => handleTimeout(name, draft, action);
    handlers[typeConstants.offline] = (draft, action) => handleOffline(name, draft, action);

    // SAGAS
    if (selectedOptions.enqueueEndpoints.has(name)) {
      watchers[name] = createWatcherSaga(
        typeConstants.enqueue,
        selectedOptions.customWatchers[name] ?? selectedOptions.enqueueWatcher,
        functions[name],
        actions[name] as ActionCreatorsMap<M>[typeof name],
      );
    } else {
      watchers[name] = createWatcherSaga(
        typeConstants.request,
        selectedOptions.customWatchers[name] ?? selectedOptions.requestWatcher,
        functions[name],
        actions[name] as ActionCreatorsMap<M>[typeof name],
      );
    }
  }

  return {
    types: types as RASCL<M>["types"],
    actions: actions as RASCL<M>["actions"],
    initialState: initialState as RASCL<M>["initialState"],
    handlers: handlers as RASCL<M>["handlers"],
    watchers: watchers as RASCL<M>["watchers"],
    reducer: createReducer(handlers as APIHandlerMap<M>, initialState as APIReducerState<M>),
    rootSaga: createRootSaga(watchers as WatcherSagaMap<M>),
  };
};

export default createRASCL;
