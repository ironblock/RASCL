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
![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/ironblock/rascl/RASCL%20CI/main?label=main&style=flat-square)

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
- [How RASCL Works](#how-rascl-works)
- [Motivation](#motivation)
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

`redux-saga` and `ky` are optional dependencies.

Both packages are highly recommended, but not strictly necessary for RASCL to function.

> **⚠︎ NOTE:** When used with TypeScript, RASCL's typings require TypeScript version 4.2 or later due to a dependency on [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html).

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

The data contained in each action is cached in the Redux store, from the **initial request parameters** through to the **successful API result** or **the details of an error**.

This makes logging and debugging extremely straightforward, and upholds a core principle of RASCL: **All the data is always available.**

## Motivation

Redux is fundamentally a way to globalize state. This flexability is extremely helpful when implementing complex and unique data models for an application, but having "complex" and "unique" API interactions can complicate and slow down development, especially on larger teams.

A common problem with storing API responses in Redux is that - given enough developers - different people will duplicate or extend Redux boilerplate according to their current focus. It often seems efficient or "cleaner" to store only a small portion of a response, knowing or assuming that the remainder is (currently) unused.



<br />

## Related Concepts
- [Cohesion](https://en.wikipedia.org/wiki/Cohesion_%28computer_science%29#High_cohesion)
- [Loose Coupling](https://en.wikipedia.org/wiki/Loose_coupling)

<br />

## Inspiration
- [redux-actions](https://github.com/acdlite/redux-actions)
- [redux-act](https://github.com/pauldijou/redux-act)