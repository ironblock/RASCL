import { ActionCreatorsMap } from "./actions";
import { ActionTypeConstantsMap, toConstant } from "./constants";
import { APIFunctionMap } from "./types/API";
import * as sagas from "./sagas";
import {
  APIHandlerMap,
  APIReducerState,
  handleFailure,
  handleMistake,
  handleOffline,
  handleRequest,
  handleSuccess,
  handleTimeout,
  initialEndpointState,
} from "./reducers";

export const createRASCL = <M extends APIFunctionMap>(
  functions: M,
): {
  actionTypes: ActionTypeConstantsMap<M>;
  actions: ActionCreatorsMap<M>;
} => {
  const names: Array<keyof M & string> = Object.keys(functions);

  const types: Partial<ActionTypeConstantsMap<M>> = {};
  const actions: Partial<ActionCreatorsMap<M>> = {};
  const initialState: Partial<APIReducerState<M>> = {};
  const handlers: Partial<APIHandlerMap<M>> = {};

  for (const name of names) {
    // TYPE CONSTANTS
    types[name] = {
      request: `${toConstant(name)}_REQUEST` as const,
      success: `${toConstant(name)}_SUCCESS` as const,
      failure: `${toConstant(name)}_FAILURE` as const,
      mistake: `${toConstant(name)}_MISTAKE` as const,
      timeout: `${toConstant(name)}_TIMEOUT` as const,
      offline: `${toConstant(name)}_OFFLINE` as const,
    };

    // ACTION CREATORS
    actions[name] = {
      request: (payload) => ({ type: types[name]!.request, payload }),
      success: (payload) => ({ type: types[name]!.success, payload }),
      failure: (payload) => ({ type: types[name]!.failure, payload, error: true }),
      mistake: (payload) => ({ type: types[name]!.mistake, payload, error: true }),
      timeout: (payload) => ({ type: types[name]!.timeout, payload, error: true }),
      offline: (payload) => ({ type: types[name]!.offline, payload, error: true }),
    };

    // REDUCER INITIAL STATE
    initialState[name] = initialEndpointState;

    // REDUCER ACTION HANDLERS
    handlers[types[name]!.request] = (draft, action) => handleRequest(name, draft, action);
    handlers[types[name]!.success] = (draft, action) => handleSuccess(name, draft, action);
    handlers[types[name]!.failure] = (draft, action) => handleFailure(name, draft, action);
    handlers[types[name]!.mistake] = (draft, action) => handleMistake(name, draft, action);
    handlers[types[name]!.timeout] = (draft, action) => handleTimeout(name, draft, action);
    handlers[types[name]!.offline] = (draft, action) => handleOffline(name, draft, action);
  }

  return {
    actionTypes: types as Readonly<ActionTypeConstantsMap<M>>,
    actions: actions as Readonly<ActionCreatorsMap<M>>,
  };
};

export default createRASCL;
