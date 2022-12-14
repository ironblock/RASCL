export type AuthenticationSelector<A> =
  | ((...args: any[]) => A | null | undefined)
  | (() => A | null | undefined);
