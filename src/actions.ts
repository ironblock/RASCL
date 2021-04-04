export type FetchResult<R> = R extends PromiseLike<infer U> ? FetchResult<U> : R;
export type APIFunctionMap = { [P: string]: (...args: unknown[]) => PromiseLike<any> };

export type RequestType<S extends string> = `${Uppercase<S>}_REQUEST`;
export type SuccessType<S extends string> = `${Uppercase<S>}_SUCCESS`;
export type FailureType<S extends string> = `${Uppercase<S>}_FAILURE`;
export type MistakeType<S extends string> = `${Uppercase<S>}_MISTAKE`;
export type TimeoutType<S extends string> = `${Uppercase<S>}_TIMEOUT`;

export type ActionTypeConstants<S extends string> = {
  readonly request: RequestType<S>;
  readonly success: SuccessType<S>;
  readonly failure: FailureType<S>;
  readonly mistake: MistakeType<S>;
  readonly timeout: TimeoutType<S>;
};

export type ActionTypeConstantsMap<F extends APIFunctionMap> = {
  readonly [K in string & keyof F]: ActionTypeConstants<K>;
};

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

export const constantCase = <S extends string>(input: S): Uppercase<S> =>
  input.toUpperCase() as Uppercase<S>;

export const generateActions = <F extends APIFunctionMap>(
  functions: F,
): {
  actionTypes: ActionTypeConstantsMap<F>;
  actions: ActionCreatorsMap<F>;
} => {
  const names: Array<keyof F & string> = Object.keys(functions);
  const actionTypes: Partial<ActionTypeConstantsMap<F>> = {};
  const actions: Partial<ActionCreatorsMap<F>> = {};

  for (const name of names) {
    actionTypes[name] = {
      request: `${constantCase(name)}_REQUEST` as const,
      success: `${constantCase(name)}_SUCCESS` as const,
      failure: `${constantCase(name)}_FAILURE` as const,
      mistake: `${constantCase(name)}_MISTAKE` as const,
      timeout: `${constantCase(name)}_TIMEOUT` as const,
    };
    actions[name] = {
      request: (req) => ({ type: actionTypes[name]!.request, payload: req }),
      success: (res) => ({ type: actionTypes[name]!.success, payload: res }),
      failure: (err) => ({ type: actionTypes[name]!.failure, payload: err, error: true }),
      mistake: (err) => ({ type: actionTypes[name]!.mistake, payload: err, error: true }),
      timeout: (err) => ({ type: actionTypes[name]!.timeout, payload: err, error: true }),
    };
  }

  return {
    actionTypes: actionTypes as ActionTypeConstantsMap<F>,
    actions: actions as ActionCreatorsMap<F>,
  };
};
