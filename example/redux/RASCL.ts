import { createRASCL } from "../../src/index";
import * as InterestRates from "../api/treasury/interestRates";

export const { types, actions, initialState, handlers, watchers, reducer, rootSaga } = createRASCL({
  ...InterestRates,
});
