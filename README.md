<h1>
  <img
    src="docs/media/RASCL%20Logo.svg"
    alt="RASCL State Diagram"
    height="60px"
    align="center"
  /> RASCL: Redux API State Caching Layer</h1>

![npm](https://img.shields.io/npm/v/rascl?style=flat-square)
![Codecov](https://img.shields.io/codecov/c/github/ironblock/rascl?style=flat-square)
![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/ironblock/rascl/RASCL%20CI/develop?label=develop&style=flat-square)
![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/ironblock/rascl/RASCL%20CI/master?label=master&style=flat-square)

RASCL is an opinionated library that creates "zero boilerplate" bridges between API clients and [Redux](https://redux.js.org).

Trying to follow established best practices for Redux [often results in repetitious code](https://redux.js.org/recipes/reducing-boilerplate). Because this type of code is tedious to write and time-consuming to maintain, it's also a frequent source of "copy/paste" errors.

Libraries like [redux-actions](https://github.com/acdlite/redux-actions) and [redux-act](https://github.com/pauldijou/redux-act) already reduce some of this boilerplate, but RASCL goes further and removes it all. 

Given a map of API calls, RASCL can generate every part of a complete Redux and [Redux-Saga](https://redux-saga.js.org/) setup:

```typescript
import * as MyAPI from "./API";

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

Once RASCL is invoked, an application only needs to do two things:

1. Dispatch Redux actions to **indirectly make API requests**
2. Use selector functions to **indirectly access the results**

---

- [Installation](#installation)
- [How to Use RASCL](#how-to-use-rascl)
- [How RASCL Works](#how-rascl-works)
  - [Starting Conditions](#starting-conditions)
  - [Making Requests](#making-requests)
  - [Handling Data](#handling-data)
  - [Recovering From Errors](#recovering-from-errors)
  - [Resolving Warnings](#resolving-warnings)
- [Actions and Stored Data](#actions-and-stored-data)
- [Motivation](#motivation)
  - [Strawman Example](#strawman-example)
- [Related Concepts](#related-concepts)
- [Inspiration](#inspiration)

---

## Installation
```
npm i -S rascl
```
or
```
yarn add rascl
```

`redux-saga` and `ky` are optional dependencies. Both are highly recommended, but not strictly necessary for RASCL to function.

**⚠︎ NOTE:** When used with TypeScript, RASCL's typings require TypeScript version 4.2 or later due to a dependency on [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html).

<br />

## How to Use RASCL

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

> `src/api/MyAPI.ts`
```typescript
export const getSomething = () => 
  fetch("https://jsonplaceholder.typicode.com/posts/1")
    .then((response) => response.json());
```

It's a good idea to call `createRASCL` in a dedicated module and export the results.

> `src/redux/RASCL.ts`
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

> `src/redux/reducer.ts`
```typescript
import { combineReducers } from "redux";

import { reducer } from "./RASCL";

const rootReducer = combineReducers({
  RASCL: reducer,
});

export default rootReducer;
```

The setup for the application's store is entirely conventional, the root reducer and root saga are each passed to their respective handlers.

> `src/redux/store.ts`
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

<br />

## How RASCL Works

RASCL tracks the "lifecycle" of each API call as a [finite state machine](https://en.wikipedia.org/wiki/Finite-state_machine). As the API call "moves" through the lifecycle, each stage dispatches a Redux action containing the relevant data.

<p align="center">
  <img
    src="docs/media/RASCL%20State%20Diagram.svg"
    alt="RASCL State Diagram"
    width="100%"
    height="275px"
  />
  <i>An API endpoint's state transitions</i>
  <br />
  <br />
</p>

The data contained in each action is cached in the Redux store, from the initial request parameters through to the successful API result (or an error). This makes logging and debugging extremely straightforward, and upholds a core principle of RASCL: **All the data is always available.**

---

### Starting Conditions
<dl>
  <dt>
<img src="https://via.placeholder.com/10/888/000000?text=+" />
<code>INITIAL</code></dt>
  <dd>This is the starting state for all endpoints. An endpoint at `INITIAL` has not been used. No API calls have been made, no actions have been dispatched, and all data fields will still be <code>null</code>.</dd>
</dl>

---

### Making Requests
<dl>
  <dt>
  <img src="https://via.placeholder.com/10/2b6a96/000000?text=+" /> <code>ENQUEUE</code> (Optional)</dt>
  <dd>The optional `ENQUEUE` state allows for common utility patterns. An "offline-first" webapp may want to allow enqueueing multiple requests while offline, or a modal login window may be rendered over the application, which has UI logic that makes API calls as soon as possible after rendering. In either case, `ENQUEUE` allows a developer to create preconditions for certain calls, for instance to say "only make this call once the device is online and the user has valid credentials".</dd>

  <dt>
  <img src="https://via.placeholder.com/10/2b6a96/000000?text=+" /> <code>REQUEST</code></dt>
  <dd>An endpoint is set to the `REQUEST` state after the API request has been made, but before any response has come back. This will set `isFetching: true`, which is useful for triggering spinners or blocking user actions while awaiting data.</dd>
</dl>

---

### Handling Data
<dl>
  <dt>
  <img src="https://via.placeholder.com/10/199e49/000000?text=+" /> <code>SUCCESS</code></dt>
  <dd>Indicates a <code>2XX</code> response from the API. May or may not include a body.</dd>
</dl>

---

### Recovering From Errors
<dl>
  <dt>
  <img src="https://via.placeholder.com/10/d22026/000000?text=+" /> <code>FAILURE</code></dt>
  <dd>Usually indicates a <code>4XX</code> response from the API.</dd>
  <dt>
  <img src="https://via.placeholder.com/10/d22026/000000?text=+" /> <code>MISTAKE</code></dt>
  <dd>Indicates a <code>5XX</code> response from the API.</dd>
</dl>

---

### Resolving Warnings
<dl>
  <dt>
  <img src="https://via.placeholder.com/10/f58420/000000?text=+" /> <code>OFFLINE</code></dt>
  <dd>Indicates that the device is offline, or otherwise has no internet connection.
  <dt>
  <img src="https://via.placeholder.com/10/f58420/000000?text=+" /> <code>TIMEOUT</code></dt>
  <dd>Indicates that the request was sent, but that the response didn't arrive in a specific timeframe.</dd>
</dl>

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

<br />

## Motivation

Redux is fundamentally a way to globalize state. This flexability is extremely helpful when implementing complex and unique data models for an application, but having "complex" and "unique" API interactions can complicate and slow down development, especially on larger teams.

A common problem with storing API responses in Redux is that - given enough developers - different people will duplicate or extend Redux boilerplate according to their current focus. It often seems efficient or "cleaner" to store only a small portion of a response, knowing or assuming that the remainder is (currently) unused.

### Strawman Example

Let's imagine that Alice and Bryce are working on a new application against an existing API.

> Alice starts a feature _"As a user, I should see my first name in the account menu"_. She looks at the API documentation, and sees that `GET /user/profile` returns an object containing `{ firstName: string }`. She creates an entry in the state tree for `reducers/user.js`, storing `firstName` so that it's accessible as `state.user.firstName`

In the real world, it's hardly likely that a user's first name is the only data from `/user/profile` this application will care about, but it serves as a useful framing device for considering what fields in a larger response body might be omitted or ignored - maybe the user profile contains a large array of that user's recent events, and this application doesn't currently use them.

> Next, Bryce starts a feature _"As a user, I should see my profile picture in the account menu"_. The image URL is contained in the same `GET user/profile` response, but now Bryce has to understand and discover all of the decisions and data muxing done by Alice. If they misunderstand Alice's intent, or overlook her implementation entirely, the outcome may be a duplication of effort, or create multiple handlers for the same API call.

> Worse still, if Alice created Redux actions and reducers around a action type of `UPDATE_USER_FIRST_NAME`, Bryce may have no choice but to either create more boilerplate for `UPDATE_USER_PROFILE_IMAGE`, or refactor the existing code to `UPDATE_USER_PROFILE`.

The first option matches the existing pattern, but worsens the technical debt, and doesn't address the fundamental problem.

The second option addresses the technical debt, but may introduce unexpected behavior or take longer to implement because Bryce has to find every place the old code was in use and update it for the new data model and action name.

<br />

## Related Concepts
- [Cohesion](https://en.wikipedia.org/wiki/Cohesion_%28computer_science%29#High_cohesion)
- [Loose Coupling](https://en.wikipedia.org/wiki/Loose_coupling) 

<br />

## Inspiration
- [redux-actions](https://github.com/acdlite/redux-actions)
- [redux-act](https://github.com/pauldijou/redux-act)