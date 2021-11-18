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

---

**Table of Contents**

- [Why RASCL?](#why-rascl)
- [How it works](#how-it-works)
- [Installation](#installation)
  - [Optional Dependencies](#optional-dependencies)
- [Related Concepts](#related-concepts)
- [Inspiration](#inspiration)

---

**Documentation**

- [Quick Start](docs/Quick_Start.md)
- [Lifecycle in Depth](docs/Lifecycle_in_Depth.md)
- [Understanding `createRASCL`](docs/Understanding_createRASCL.md)
- [Common Patterns](docs/Common_Patterns.md)
- [Motivation and Philosophy](docs/Motivation_and_Philosophy.md)

---

<br />

## Why RASCL?

Trying to follow established best practices for Redux [often results in repetitious code](https://redux.js.org/recipes/reducing-boilerplate). Because this type of code is tedious to write and time-consuming to maintain, it's also a frequent source of "copy/paste" errors.

Libraries like [redux-actions](https://github.com/acdlite/redux-actions) and [redux-act](https://github.com/pauldijou/redux-act) already reduce some of this boilerplate, but RASCL goes further and removes it all.

<br />

## How it works

Given a map of API calls, RASCL can generate every part of a complete Redux and [Redux-Saga](https://redux-saga.js.org/) setup:

```typescript
import * as MyAPI from "./API";

const { createRASCL } = await import("rascl");

export const {
  types, //         String constants for action types
  actions, //       Action creator functions
  initialState, //  Initial Redux store state
  handlers, //      Action handlers for state updates
  watchers, //      Sagas to respond to each type of action
  reducer, //       A root reducer
  rootSaga, //      A root saga
} = createRASCL(MyAPI);
```

RASCL then tracks the "lifecycle" of each API call as a [finite state machine](https://en.wikipedia.org/wiki/Finite-state_machine). As the API call "moves" through the lifecycle, each stage dispatches a Redux action containing the relevant data.

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

Therefore, once RASCL is configured and invoked, an application only needs to do two things:

1. Dispatch Redux actions to **indirectly** make API requests
2. Use selector functions to **indirectly** access the results

<br />

## Installation

```
npm i -S rascl
```

or

```
yarn add rascl
```

<br />

### Optional Dependencies

RASCL works extremely well with a collection of other packages, but none of these is strictly necessary for RASCL to function.

<dl>
  <dt>
    <a href="https://github.com/redux-saga/redux-saga"><code>redux-saga</code></a>
  </dt>
  <dd>
    Manage and compose side effects. Used with RASCL to manage "business logic" in API requests.
  </dd>
  <dt>
    <a href="https://github.com/sindresorhus/ky"><code>ky</code></a>
  </dt>
  <dd>
    A more ergonomic and concise way use the <code>fetch</code> API. Used with RASCL to simplify API client code.
  </dd>
  <dt>
    <a href="https://github.com/reduxjs/reselect"><code>reselect</code></a>
  </dt>
  <dd>
    Compute derived data, memoize complex operations. Used with RASCL to access API response data in a performant way.
  </dd>
  <dt>
    <a href="https://github.com/microsoft/TypeScript"><code>typescript</code></a>
  </dt>
  <dd>
    Strongly-typed JavaScript. Used with RASCL to provide type information for API response data and ensure beautiful autocomplete in code editors.
  </dd>
</dl>

> <br />**⚠︎ IMPORTANT NOTE**<br />When used with TypeScript, RASCL's type declarations require TypeScript version 4.2 or greater due to a dependency on [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html). Earlier versions of TypeScript will produce opaque errors.<br /><br />

<br />

## Related Concepts

- [Cohesion](https://en.wikipedia.org/wiki/Cohesion_%28computer_science%29#High_cohesion)
- [Loose Coupling](https://en.wikipedia.org/wiki/Loose_coupling)

<br />

## Inspiration

- [redux-actions](https://github.com/acdlite/redux-actions)
- [redux-act](https://github.com/pauldijou/redux-act)
