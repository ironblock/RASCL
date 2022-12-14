export interface NetworkErrorDetails {
  response?: Response;
  body?: any;
}

export class NetworkError extends Error {
  response: NetworkErrorDetails["response"];
  body: NetworkErrorDetails["body"];

  constructor(details: NetworkErrorDetails | null, ...rest: any[]) {
    super(...rest);

    this.name = "NetworkError";
    this.response = details?.response;
    this.body = details?.body;
  }
}

export class FailureError extends NetworkError {
  constructor(details: NetworkErrorDetails | null, ...rest: any[]) {
    super(details, ...rest);

    this.name = "NetworkError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, FailureError);
    }
  }
}

export class MistakeError extends NetworkError {
  constructor(details: NetworkErrorDetails | null, ...rest: any[]) {
    super(details, ...rest);

    this.name = "MistakeError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, MistakeError);
    }
  }
}

export class TimeoutError extends NetworkError {
  constructor(details: NetworkErrorDetails | null, ...rest: any[]) {
    super(details, ...rest);

    this.name = "TimeoutError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, TimeoutError);
    }
  }
}

export class OfflineError extends NetworkError {
  constructor(details: NetworkErrorDetails | null, ...rest: any[]) {
    super(details, ...rest);

    this.name = "OfflineError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, OfflineError);
    }
  }
}
