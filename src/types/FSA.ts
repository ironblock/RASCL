export interface FluxStandardAction<T extends string, P extends any, M extends any = null> {
  type: T;
  payload?: P;
  error?: boolean;
  meta?: M;
}

export interface FluxStandardActionError<
  T extends string,
  P extends Error | undefined,
  M extends any = null
> extends FluxStandardAction<T, P, M> {
  error: true;
  payload?: P;
}

export type { FluxStandardAction as FSA };
export type { FluxStandardActionError as FSE };
