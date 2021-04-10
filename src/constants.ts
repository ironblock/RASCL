import { SnakeCase } from "type-fest";
import { snakeCase } from "lodash";
import { APIFunctionMap, EndpointState } from "./types/API";
import { RASCL } from ".";

export type ConstantCase<S extends string> = Uppercase<SnakeCase<S>>;

export type RequestType<S extends string> = `${ConstantCase<S>}_REQUEST`;
export type SuccessType<S extends string> = `${ConstantCase<S>}_SUCCESS`;
export type FailureType<S extends string> = `${ConstantCase<S>}_FAILURE`;
export type MistakeType<S extends string> = `${ConstantCase<S>}_MISTAKE`;
export type TimeoutType<S extends string> = `${ConstantCase<S>}_TIMEOUT`;
export type OfflineType<S extends string> = `${ConstantCase<S>}_OFFLINE`;

export type ActionTypeConstants<S extends string> = {
  readonly request: RequestType<S>;
  readonly success: SuccessType<S>;
  readonly failure: FailureType<S>;
  readonly mistake: MistakeType<S>;
  readonly timeout: TimeoutType<S>;
  readonly offline: OfflineType<S>;
};

export type ActionTypeConstantsMap<M extends APIFunctionMap> = {
  [K in string & keyof M]: ActionTypeConstants<K>;
};

export const toConstant = <S extends string>(input: S): ConstantCase<S> =>
  snakeCase(input).toUpperCase() as ConstantCase<S>;

export const createTypeConstants = <M extends APIFunctionMap, K extends keyof M & string>(
  name: K,
): RASCL<M>["types"][K] => ({
  request: `${toConstant(name)}_REQUEST` as const,
  success: `${toConstant(name)}_SUCCESS` as const,
  failure: `${toConstant(name)}_FAILURE` as const,
  mistake: `${toConstant(name)}_MISTAKE` as const,
  timeout: `${toConstant(name)}_TIMEOUT` as const,
  offline: `${toConstant(name)}_OFFLINE` as const,
});
