import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import createSagaMiddleware from "redux-saga";

import { reducer, rootSaga } from "./RASCL";

export const sagaMiddleware = createSagaMiddleware();
export const enhancer = composeWithDevTools(applyMiddleware(sagaMiddleware));
export const store = createStore(reducer, enhancer);

sagaMiddleware.run(rootSaga);
