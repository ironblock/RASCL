import { ActionCreatorsMap } from "./actions";
import { ActionTypeConstantsMap } from "./constants";
// import * as sagas from "./sagas";
// import * as reducers from "./reducers";

export const createRASCL = <F extends APIFunctionMap>(
  functions: F,
): {
  actionTypes: ActionTypeConstantsMap<F>;
  actions: ActionCreatorsMap<F>;
} => {
  const names: Array<keyof F & string> = Object.keys(functions);
  const actionTypes: Partial<ActionTypeConstantsMap<F>> = {};
  const actions: Partial<ActionCreatorsMap<F>> = {};

  for (const name of names) {
    actionTypes[name] = {
      request: `${name.toUpperCase() as Uppercase<typeof name>}_REQUEST` as const,
      success: `${name.toUpperCase() as Uppercase<typeof name>}_SUCCESS` as const,
      failure: `${name.toUpperCase() as Uppercase<typeof name>}_FAILURE` as const,
      mistake: `${name.toUpperCase() as Uppercase<typeof name>}_MISTAKE` as const,
      timeout: `${name.toUpperCase() as Uppercase<typeof name>}_TIMEOUT` as const,
    };
    actions[name] = {
      request: (req) => ({ type: actionTypes[name]!.request, payload: req }),
      success: (res) => ({ type: actionTypes[name]!.success, payload: res }),
      failure: (err) => ({ type: actionTypes[name]!.failure, payload: err, error: true }),
      mistake: (err) => ({ type: actionTypes[name]!.mistake, payload: err, error: true }),
      timeout: (err) => ({ type: actionTypes[name]!.timeout, payload: err, error: true }),
    };
  }

  return {
    actionTypes: actionTypes as Readonly<ActionTypeConstantsMap<F>>,
    actions: actions as Readonly<ActionCreatorsMap<F>>,
  };
};

export default createRASCL;
