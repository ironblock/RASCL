# RASCL Quick Start

For complete documentation on the concepts used in this guide, please refer to [Understanding `createRASCL`](Understanding_createRASCL.md) and [Lifecycle in Depth](Lifecycle_in_Depth.md).

This example represents a complete but simplified implementation of RASCL. It assumes the following directory structure:
```
src
 ┣ api
 ┃  ┗ MyAPI.ts
 ┗ redux
    ┣ RASCL.ts
    ┣ reducer.ts
    ┗ store.ts
```

<br />
<hr />
<br />

## `src/api/MyAPI.ts`
```typescript
export const getSomething = () =>
  fetch("https://jsonplaceholder.typicode.com/posts/1")
    .then((response) => response.json());

export const getSomethingElse = () =>
  fetch("https://jsonplaceholder.typicode.com/posts/2")
    .then((response) => response.json());
```
The API file should export either an object, or individual named exports that can be imported with a wildcard.

> <br />**⚠︎ IMPORTANT NOTE**<br />
> RASCL uses the names of a module's exported members as the basis for all action types and function signatures. Based on these names, RASCL will generate several different outputs based on conventional Redux naming conventions and established best practices.<br /><br />

<br />
<hr />
<br />

## `src/redux/RASCL.ts`
```typescript
import * as MyAPI from "../api/MyAPI";
const { createRASCL } = await import("rascl");

export const {
  types,         // String constants for action types
  actions,       // Action creator functions
  initialState,  // Initial Redux store state
  handlers,      // Action handlers for state updates
  watchers,      // Sagas to respond to each type of action
  reducer,       // A root reducer
  rootSaga,      // A root saga
} = createRASCL(MyAPI);
```

It's a good idea to call `createRASCL` in a dedicated module and export the results. In most cases, `types`, `initialState`, `handlers`, and `watchers` won't be used directly by the consuming application, but are provided for debugging and expansion purposes.

<br />
<hr />
<br />

## `src/redux/reducer.ts`
```typescript
import { combineReducers } from "redux";

import { reducer } from "./RASCL";

const rootReducer = combineReducers({
  RASCL: reducer,
});

export default rootReducer;
```

The `reducer` object output by `createRASCL` is a completely conventional Redux reducer. It can be used as-is, or passed to `combineReducers` to create a root reducer.

<br />
<hr />
<br />

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

The setup for the application's store is also entirely conventional, and RASCL does not need any special configuration here.

<br />
<hr />
<br />

## Accessing the Store

Nothing about accessing the store is special, either. The only concept that is unique to RASCL is the mandatory shape of RASCL's portion of the store, which is described in [Initial Redux store state section](Understanding_createRASCL.md#Initial%20Redux%20store%20state) of [Understanding `createRASCL`](Understanding_createRASCL.md)
