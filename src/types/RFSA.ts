export interface RASCLFluxStandardAction<
  T extends string,
  P extends unknown,
  M extends any = null
> {
  type: T;
  payload: P;
  error?: boolean;
  meta?: M;
}

export interface RASCLFluxStandardActionError<
  T extends string,
  P extends Error | null = null,
  M extends any = null
> extends RASCLFluxStandardAction<T, P, M> {
  error: true;
  payload: P;
}

export type { RASCLFluxStandardAction as RFSA };
export type { RASCLFluxStandardActionError as RFSE };
