import { combineReducers } from "redux";

import { reducer as RASCLReducer } from "../RASCL";

const rootReducer = combineReducers({
  RASCL: RASCLReducer,
});

export default rootReducer;
