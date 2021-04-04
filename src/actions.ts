export type ActionCreators<S extends string, F extends (...args: any) => PromiseLike<any>> = {
  readonly request: (req: Parameters<F>) => FSA<RequestType<S>, typeof req>;
  readonly success: (res: FetchResult<ReturnType<F>>) => FSA<SuccessType<S>, typeof res>;
  readonly failure: (err?: Error) => FSE<FailureType<S>, typeof err>;
  readonly mistake: (err?: Error) => FSE<MistakeType<S>, typeof err>;
  readonly timeout: (err?: Error) => FSE<TimeoutType<S>, typeof err>;
};

export type ActionCreatorsMap<F extends APIFunctionMap> = {
  [K in string & keyof F]: ActionCreators<K, F[K]>;
};
