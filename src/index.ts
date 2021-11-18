import type { ActionCreatorsMap } from "./actions";
import { createActions } from "./actions";
import type { ActionTypeConstantsMap } from "./constants";
import { createTypeConstants } from "./constants";
import type { APIHandlerMap, APIReducer, APIReducerState } from "./reducers";
import {
  createReducer,
  handleFailure,
  handleMistake,
  handleOffline,
  handleRequest,
  handleSuccess,
  handleTimeout,
  initialEndpointState,
} from "./reducers";
import type { WatcherSaga, WatcherSagaMap } from "./sagas";
import { createRootSaga, createWatcherSaga, kyRequestSaga } from "./sagas";
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
  defaultWatcher: WatcherSaga<keyof M & string, M>;
  watchers: { [k in keyof M]: WatcherSaga<keyof M & string, M> };
}

export const defaultOptions: Options<any> = {
  defaultWatcher: kyRequestSaga,
  watchers: {},
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
    handlers[typeConstants.request] = (draft, action) => handleRequest(name, draft, action);
    handlers[typeConstants.success] = (draft, action) => handleSuccess(name, draft, action);
    handlers[typeConstants.failure] = (draft, action) => handleFailure(name, draft, action);
    handlers[typeConstants.mistake] = (draft, action) => handleMistake(name, draft, action);
    handlers[typeConstants.timeout] = (draft, action) => handleTimeout(name, draft, action);
    handlers[typeConstants.offline] = (draft, action) => handleOffline(name, draft, action);

    // SAGAS
    watchers[name] = createWatcherSaga(
      typeConstants.request,
      watchers[name] ?? selectedOptions.defaultWatcher,
      functions[name],
      actions[name] as ActionCreatorsMap<M>[typeof name],
    );
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
