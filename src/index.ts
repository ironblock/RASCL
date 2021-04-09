import { ActionCreatorsMap, createActions } from "./actions";
import { ActionTypeConstantsMap, toConstant } from "./constants";
import { APIFunctionMap } from "./types/API";
import {
  APIHandlerMap,
  APIReducer,
  APIReducerState,
  createReducer,
  handleFailure,
  handleMistake,
  handleOffline,
  handleRequest,
  handleSuccess,
  handleTimeout,
  initialEndpointState,
} from "./reducers";
import { createRootSaga, createWatcherSaga, kyPublicRequestSaga, WatcherSagaMap } from "./sagas";

export type RASCL<M extends APIFunctionMap> = {
  types: ActionTypeConstantsMap<M>;
  actions: ActionCreatorsMap<M>;
  initialState: APIReducerState<M>;
  handlers: APIHandlerMap<M>;
  watchers: WatcherSagaMap<M>;
  reducer: APIReducer<M>;
  rootSaga: ReturnType<typeof createRootSaga>;
};

export const createRASCL = <M extends APIFunctionMap>(functions: M): RASCL<M> => {
  const names: Array<keyof M & string> = Object.keys(functions);

  const types: Partial<RASCL<M>["types"]> = {};
  const actions: Partial<RASCL<M>["actions"]> = {};
  const initialState: Partial<RASCL<M>["initialState"]> = {};
  const handlers: Partial<RASCL<M>["handlers"]> = {};
  const watchers: Partial<RASCL<M>["watchers"]> = {};

  for (const name of names) {
    const typeConstants = {
      request: `${toConstant(name)}_REQUEST` as const,
      success: `${toConstant(name)}_SUCCESS` as const,
      failure: `${toConstant(name)}_FAILURE` as const,
      mistake: `${toConstant(name)}_MISTAKE` as const,
      timeout: `${toConstant(name)}_TIMEOUT` as const,
      offline: `${toConstant(name)}_OFFLINE` as const,
    };

    // TYPE CONSTANTS
    types[name] = typeConstants;

    // ACTION CREATORS
    actions[name] = createActions(typeConstants);

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
      kyPublicRequestSaga,
      typeConstants.request,
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
