<h1>
  <img
    src="docs/media/RASCL%20Logo.svg"
    alt="RASCL State Diagram"
    height="60px"
    align="center"
  /> RASCL: Redux API State Caching Layer</h1>

The **Redux API State Caching Layer** (RASCL) is a pattern used by webapps to interact with APIs.

The goal of a RASCL implementation is to create [highly cohesive](https://en.wikipedia.org/wiki/Cohesion_%28computer_science%29#High_cohesion) and [loosely coupled](https://en.wikipedia.org/wiki/Loose_coupling) interfaces to an API client. To do this, each API endpoint is treated as a globally unique [finite state machine](https://en.wikipedia.org/wiki/Finite-state_machine). The consuming application makes API requests indirectly by dispatching actions, and accesses the returned data indirectly with selector functions.

<p align="center">
  <img
    src="docs/media/RASCL%20State%20Diagram.svg"
    alt="RASCL State Diagram"
    height="320px"
    width="100%"
  />
  <i>An API endpoint's state transitions</i>
</p>

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

<sub>_**NOTE**: This is a simplified example of the TypeScript interfaces for illustrative purposes. For the actual implementations used by this library, see [reducers.ts](./src/reducers.ts)_</sub>
