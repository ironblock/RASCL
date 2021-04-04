declare type EndpointState = "request" | "success" | "failure" | "timeout" | "mistake";

declare interface EndpointMetadata {
  [k: string]: any;
  readonly isFetching: boolean;
  readonly lastUpdate: number | null;
  readonly lastResult: EndpointState | null;
}

declare interface Endpoint<R = null, S = null, F = null, M = null, T = null>
  extends EndpointMetadata {
  request: R | null;
  success: S | null;
  failure: F | null;
  mistake: M | null;
  timeout: T | null;
}

declare interface FluxStandardAction<T extends string, P extends any, M extends any = null> {
  [k: "type" | "payload" | "error" | "meta"]: unknown;
  type: T;
  payload?: P;
  error?: boolean;
  meta?: M;
}

declare interface FluxStandardActionError extends FluxStandardAction {
  error: true;
  payload?: Error;
}

declare type FSA<T, P, M = null> = FluxStandardAction<T, P, M>;
declare type FSE<T, P, M = null> = FluxStandardActionError<T, P, M>;
