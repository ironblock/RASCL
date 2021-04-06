export type FetchResult<R> = R extends PromiseLike<infer U> ? FetchResult<U> : R;
export type APICallWithParams = (...args: any[]) => FetchResult<any>;
export type APICallNoParams = () => FetchResult<any>;
export type GenericAPICall = APICallWithParams | APICallNoParams;
export type APIFunctionMap = { [P in string]: GenericAPICall };

export interface EndpointStateMap {
  readonly request: unknown;
  readonly success: unknown;
  readonly failure: unknown;
  readonly mistake: unknown;
  readonly timeout: unknown;
  readonly offline: unknown;
}
export type EndpointState = keyof EndpointStateMap;
