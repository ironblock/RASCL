
## Actions and Stored Data

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
