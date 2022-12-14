# Understanding `createRASCL`

`createRASCL` is essentially the entire "API" of the RASCL package. `createRASCL` takes a simple object representing the API (typically a module with named exports) and generates several different kinds of outputs.

```ts
import * as MyAPI from "../api/MyAPI";
const { createRASCL } = await import("rascl");

export const {
  types, // String constants for action types
  actions, // Action creator functions
  initialState, // Initial Redux store state
  handlers, // Action handlers for state updates
  watchers, // Sagas to respond to each type of action
  reducer, // A root reducer
  rootSaga, // A root saga
} = createRASCL(MyAPI);
```

When using RASCL in conjunction with `redux-saga`, most consuming code will only need to interact with `actions`. The other outputs are used internally by RASCL, but also may be useful for debugging, testing, and custom implementations or extensions.

### String constants for action types

Each export in the API file will be given a string constant for each of RASCL's lifecycle stages, `ENQUEUE`, `REQUEST`, `SUCCESS`, `FAILURE`, `MISTAKE`, `TIMEOUT`, and `OFFLINE`. The name is based on a combination of the `SNAKE_CASE` version of the export name and the stage name.

So `getSomething` will have the following action types created:

```
  GET_SOMETHING_ENQUEUE
  GET_SOMETHING_REQUEST
  GET_SOMETHING_SUCCESS
  GET_SOMETHING_FAILURE
  GET_SOMETHING_MISTAKE
  GET_SOMETHING_TIMEOUT
  GET_SOMETHING_OFFLINE
```

Likewise, `getSomethingElse` will have `GET_SOMETHING_ELSE_ENQUEUE` and `GET_SOMETHING_ELSE_REQUEST` and so on.

Ultimately, these types are an internal implementation detail of RASCL, and generally should not be used directly. They are, however, useful for debugging and testing, particularly in conjunction with Redux DevTools.

<br />

### Action creator functions

<br />

### Initial Redux store state

Endpoint state objects all have the same shape, consisting of **metadata**, used to determine "where" in the state diagram the endpoint currently is, and **state data**, used to cache the last result of a given type.

The initial state for every endpoint looks like this:

```js
{
  /**
   * STATE DATA
   * Parameters for requests, API results, errors, etc.
   */
  enqueue: null,
  request: null,
  success: null,
  failure: null,
  mistake: null,
  timeout: null,
  offline: null,

  /**
   * METADATA
   * Location in the finite state machine, helpers for
   * showing how old the last result is, are we
   * currently awaiting data, etc. This helps with common
   * patterns like "show a spinner while waiting for
   * results from the API".
   */
  isFetching: false,
  lastUpdate: null,
  lastResult: null,
}
```

<br />

### Action handlers for state updates

Each step in the lifecycle dispatches a Redux action containing the exact relevant data for that step, in the form of a [Flux Standard Action](https://github.com/redux-utilities/flux-standard-action#flux-standard-action). The `payload` of each action is recorded in the Redux store.

For example, a call that completes successfully will have an entry in the store that looks something like this:

```js
{
  enqueue: {/* Original parameters for the API call */},
  request: {/* Original parameters plus any authentication */},
  success: {/* Parsed response or other data from the API */},
  failure: null,
  mistake: null,
  timeout: null,
  offline: null,
  isFetching: false,
  lastUpdate: 1626261600000,
  lastResult: "success",
}
```

<br />

### Sagas to respond to each type of action

<br />

### A root reducer

<br />

### A root saga
