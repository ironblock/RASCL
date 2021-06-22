# RASCL Quick Start

RASCL is designed to fit into any existing Redux implementation. 

This simple example assumes the following directory structure:
```
src
 ┣ api
 ┃  ┗ MyAPI.ts
 ┗ redux
    ┣ RASCL.ts
    ┣ reducer.ts
    ┗ store.ts
```
The API file should export either an object, or individual named exports that can be imported with a wildcard. RASCL uses the names of these functions as the basis for all the action types and function signatures

<br>

## `src/api/MyAPI.ts`
```typescript
export const getSomething = () => 
  fetch("https://jsonplaceholder.typicode.com/posts/1")
    .then((response) => response.json());
```

It's a good idea to call `createRASCL` in a dedicated module and export the results.

<br>

## `src/redux/RASCL.ts`
```typescript
import * as MyAPI from "../api/MyAPI";
const { createRASCL } = await import("rascl");

export const {
  types,
  actions,
  initialState,
  handlers,
  watchers,
  reducer,
  rootSaga,
} = createRASCL(MyAPI);
```

Then, add the reducer into `combineReducers`:

<br>

## `src/redux/reducer.ts`
```typescript
import { combineReducers } from "redux";

import { reducer } from "./RASCL";

const rootReducer = combineReducers({
  RASCL: reducer,
});

export default rootReducer;
```

The setup for the application's store is entirely conventional, the root reducer and root saga are each passed to their respective handlers.

<br>

## `src/redux/store.ts`
```typescript
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";

import rootReducer from "./reducer";
import { rootSaga } from "./RASCL";

export const sagaMiddleware = createSagaMiddleware();
export const enhancer = applyMiddleware(sagaMiddleware);
export const store = createStore(rootReducer, enhancer);

sagaMiddleware.run(rootSaga);
```
