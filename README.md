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

RASCL is a way for webapps to use [Redux](https://redux.js.org) and [Redux-Saga](https://redux-saga.js.org/) to interact with APIs - without the boilerplate!

Given a mapping of API calls, RASCL automatically creates all the things Redux and Redux-Saga need: sagas, type constants, action creators, and a reducer.

Once configured, a webapp using RASCL only needs to do two things:
1. Dispatch Redux actions to **indirectly make API requests**
2. Use selector functions to **indirectly access the results**.


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

The data contained in each action is cached in the Redux store, from the initial request parameters through to the successful API result. This makes logging and debugging extremely straightforward, and upholds a core principle of RASCL: **All the data is always available.**

### Endpoint Lifecycle

<dl>
  <dt><code>INITIAL</code></dt>
  <dd>This endpoint has not been used, no actions have been dispatched, and all data fields will still be `null`.</dd>
</dl>


<dl>
  <dt><code>ENQUEUE</code> (Optional)</dt>
  <dd>Ullamco consectetur voluptate consectetur eiusmod fugiat. Culpa mollit elit dolor adipisicing voluptate et enim nostrud excepteur exercitation nulla. Ullamco voluptate ullamco aliqua minim anim nostrud nostrud quis est.</dd>

  <dt><code>REQUEST</code></dt>
  <dd>Excepteur in aliqua aliqua et deserunt cillum do Lorem enim est labore duis.Adipisicing pariatur commodo elit dolore duis et in Lorem id cillum consectetur elit.</dd>
</dl>


<dl>
  <dt><code>SUCCESS</code></dt>
  <dd>Dolor pariatur adipisicing id tempor pariatur cillum magna anim mollit officia irure nisi labore eiusmod.Eiusmod mollit aute sit ipsum reprehenderit minim.</dd>

  <dt><code>REQUEST</code></dt>
  <dd>Culpa deserunt sint sunt sunt nostrud.Irure commodo pariatur occaecat eu enim dolor mollit aliqua.</dd>
</dl>

### Actions and Stored Data

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
   * Location in the finite state machine, helpers for showing how old the last
   * result is, are we currently awaiting data, etc. This helps with common
   * patterns like "show a spinner while waiting for results from the API".
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
  enqueue: {/* Original parameters for the call */},
  request: {/* Original parameters plus authentication or other additions */},
  success: {/* The parsed response or other data returned from your API */},
  failure: null,
  mistake: null,
  timeout: null,
  offline: null,
  isFetching: false,
  lastUpdate: 1626261600000,
  lastResult: "success",
}
```

```typescript
interface Metadata {
  // API request was sent, waiting for a response
  isFetching: boolean;

  // Last time this object changed (UNIX timestamp)
  lastUpdate: number | null;

  // State key assigned to the last response
  lastResult:
    | "enqueue"
    | "request"
    | "success"
    | "failure"
    | "mistake"
    | "timeout"
    | "offline"
    | null;
}

interface Data {
  enqueue: EnqueueResult | null;
  request: RequestResult | null;
  success: SuccessResult | null;
  failure: FailureResult | null;
  mistake: MistakeResult | null;
  timeout: TimeoutResult | null;
  offline: OfflineResult | null;
}

type EndpointStateShape = EndpointMetadata & EndpointData;
```

<sub align="center">_**NOTE**: These interfaces are simplified examples for illustrative purposes.\
For the actual TypeScript implementations used by this library, see [reducers.ts](./src/reducers.ts)_</sub>


# Related Concepts
[highly cohesive](https://en.wikipedia.org/wiki/Cohesion_%28computer_science%29#High_cohesion) and [loosely coupled](https://en.wikipedia.org/wiki/Loose_coupling) interfaces to an API client.