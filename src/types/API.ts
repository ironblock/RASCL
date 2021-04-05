export type FetchResult<R> = R extends PromiseLike<infer U> ? FetchResult<U> : R;
export type GenericAPICall = (...args: any[] | never[]) => FetchResult<any> | undefined;
export type APIFunctionMap = { [P in string]: GenericAPICall };

export type EndpointState = "request" | "success" | "failure" | "timeout" | "mistake";

export interface EndpointMetadata {
  [k: string]: any;
  readonly isFetching: boolean;
  readonly lastUpdate: number | null;
  readonly lastResult: EndpointState | null;
}

export interface Endpoint<R = null, S = null, F = null, M = null, T = null>
  extends EndpointMetadata {
  request: R | null;
  success: S | null;
  failure: F | null;
  mistake: M | null;
  timeout: T | null;
}
