export type ActionTypeConstants<S extends string> = {
  readonly request: RequestType<S>;
  readonly success: SuccessType<S>;
  readonly failure: FailureType<S>;
  readonly mistake: MistakeType<S>;
  readonly timeout: TimeoutType<S>;
};

export type ActionTypeConstantsMap<F extends APIFunctionMap> = {
  [K in string & keyof F]: ActionTypeConstants<K>;
};
