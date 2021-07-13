import { createRASCL } from "../../src/index";
import * as InterestRates from "../api/treasury/interestRates";

export const {
  types, //         String constants for action types
  actions, //       Action creator functions
  initialState, //  Initial Redux store state
  handlers, //      Action handlers for state updates
  watchers, //      Sagas to respond to each type of action
  reducer, //       A root reducer
  rootSaga, //      A root saga
} = createRASCL({
  ...InterestRates,
});

export type RASCLState = typeof initialState;
