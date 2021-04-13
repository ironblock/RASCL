export type FetchResult<R> = R extends PromiseLike<infer U> ? FetchResult<U> : R;

export type APICallWithAuthentication = (authentication: any, ...args: any[]) => FetchResult<any>;
export type APICallWithParams = (...args: any[]) => FetchResult<any>;
export type APICallNoParams = () => FetchResult<any>;
export type GenericAPICall = APICallWithAuthentication | APICallWithParams | APICallNoParams;

export type APIFunctionMapWithAuthentication = { [P in string]: APICallWithAuthentication };
export type APIFunctionMapWithParams = { [P in string]: APICallWithParams };
export type APIFunctionMapNoParams = { [P in string]: APICallNoParams };
export type APIFunctionMap = { [P in string]: GenericAPICall };

export interface EndpointStateMap {
  readonly enqueue: unknown;
  readonly request: unknown;
  readonly success: unknown;
  readonly failure: unknown;
  readonly mistake: unknown;
  readonly timeout: unknown;
  readonly offline: unknown;
}
export type EndpointState = keyof EndpointStateMap;
