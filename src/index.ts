import { ActionCreatorsMap } from "./actions";
import { ActionTypeConstantsMap, toConstant } from "./constants";
import { APIFunctionMap } from "./types/API";
// import * as sagas from "./sagas";
// import * as reducers from "./reducers";

export const createRASCL = <M extends APIFunctionMap>(
  functions: M,
): {
  actionTypes: ActionTypeConstantsMap<M>;
  actions: ActionCreatorsMap<M>;
} => {
  const names: Array<keyof M & string> = Object.keys(functions);
  const actionTypes: Partial<ActionTypeConstantsMap<M>> = {};
  const actions: Partial<ActionCreatorsMap<M>> = {};

  for (const name of names) {
    actionTypes[name] = {
      request: `${toConstant(name)}_REQUEST` as const,
      success: `${toConstant(name)}_SUCCESS` as const,
      failure: `${toConstant(name)}_FAILURE` as const,
      mistake: `${toConstant(name)}_MISTAKE` as const,
      timeout: `${toConstant(name)}_TIMEOUT` as const,
      offline: `${toConstant(name)}_OFFLINE` as const,
    };

    actions[name] = {
      request: (payload?) => ({ type: actionTypes[name]!.request, payload }),
      success: (payload?) => ({ type: actionTypes[name]!.success, payload }),
      failure: (payload?) => ({ type: actionTypes[name]!.failure, payload, error: true }),
      mistake: (payload?) => ({ type: actionTypes[name]!.mistake, payload, error: true }),
      timeout: (payload?) => ({ type: actionTypes[name]!.timeout, payload, error: true }),
      offline: (payload?) => ({ type: actionTypes[name]!.offline, payload, error: true }),
    };
  }

  return {
    actionTypes: actionTypes as Readonly<ActionTypeConstantsMap<M>>,
    actions: actions as Readonly<ActionCreatorsMap<M>>,
  };
};

export default createRASCL;
