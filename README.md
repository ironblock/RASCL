<h1>
  <img
    src="docs/media/RASCL%20Logo.svg"
    alt="RASCL State Diagram"
    height="60px"
    align="center"
  /> RASCL: Redux API State Caching Layer</h1>

![npm](https://img.shields.io/npm/v/rascl?style=flat-square)
![Codecov](https://img.shields.io/codecov/c/github/ironblock/rascl?style=flat-square)
![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/ironblock/rascl/RASCL%20CI/develop?label=Develop%20build&style=flat-square)

RASCL is a way for webapps to use [Redux](https://redux.js.org) and [Redux-Saga](https://redux-saga.js.org/) to interact with APIs - without the boilerplate!

Given a mapping of API calls, RASCL automatically creates all the things Redux and Redux-Saga need: sagas, type constants, action creators, and a reducer.

Once configured, a webapp using RASCL only needs to do two things:
1. Dispatch Redux actions to **indirectly make API requests**
2. Use selector functions to **indirectly access the results**.


## How RASCL Works

RASCL tracks the "lifecycle" of each API call as a [finite state machine](https://en.wikipedia.org/wiki/Finite-state_machine). This helps with a lot of common patterns, like "show the user a spinner while waiting for the API" and "don't make requests until the user is authenticated".

<center>
   <figure>
     <img
       src="docs/media/RASCL%20State%20Diagram.svg"
       alt="RASCL State Diagram"
       height="320px"
       width="100%"
     />
     <figcaption><i>An API endpoint's state transitions</i></figcaption>
   </figure>
</center>

Each endpoint starts with the same state.
<dl>
  <dt><code>INITIAL</code></dt>
  <dd>The new version of this product costs significantly less than the previous one!</dd>
</dl>

- , signifying that it is completely unmodified from
## Goals



Endpoint state objects all have the same shape, consisting of **metadata**, used to determine "where" in the state diagram the endpoint currently is, and **state data**, used to cache the last result of a given type.

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