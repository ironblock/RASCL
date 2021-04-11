import { AsyncReturnType } from "type-fest";
import {
  RequestType,
  SuccessType,
  FailureType,
  MistakeType,
  TimeoutType,
  OfflineType,
  ActionTypeConstantsMap,
} from "./constants";
import { APIFunctionMap, EndpointStateMap } from "./types/API";
import { RFSA, RFSE } from "./types/RFSA";

export interface ActionCreators<K extends string, M extends APIFunctionMap>
  extends EndpointStateMap {
  readonly request: (req: Parameters<M[K]>) => RFSA<RequestType<K>, typeof req>;
  readonly success: (res: AsyncReturnType<M[K]>) => RFSA<SuccessType<K>, typeof res>;
  readonly failure: (err: Error) => RFSE<FailureType<K>, typeof err>;
  readonly mistake: (err: Error) => RFSE<MistakeType<K>, typeof err>;
  readonly timeout: (err: Error) => RFSE<TimeoutType<K>, typeof err>;
  readonly offline: (err: Error) => RFSE<OfflineType<K>, typeof err>;
}

export type ActionCreatorsMap<M extends APIFunctionMap> = {
  [K in string & keyof M]: ActionCreators<K, M>;
};

export type RequestAction<K extends string & keyof M, M extends APIFunctionMap> = ReturnType<
  ActionCreatorsMap<M>[K]["request"]
>;
export type SuccessAction<K extends string & keyof M, M extends APIFunctionMap> = ReturnType<
  ActionCreatorsMap<M>[K]["success"]
>;
export type FailureAction<K extends string & keyof M, M extends APIFunctionMap> = ReturnType<
  ActionCreatorsMap<M>[K]["failure"]
>;
export type MistakeAction<K extends string & keyof M, M extends APIFunctionMap> = ReturnType<
  ActionCreatorsMap<M>[K]["mistake"]
>;
export type TimeoutAction<K extends string & keyof M, M extends APIFunctionMap> = ReturnType<
  ActionCreatorsMap<M>[K]["timeout"]
>;
export type OfflineAction<K extends string & keyof M, M extends APIFunctionMap> = ReturnType<
  ActionCreatorsMap<M>[K]["offline"]
>;

export const createActions = <M extends APIFunctionMap, K extends keyof M & string>(
  types: ActionTypeConstantsMap<M>[K],
): ActionCreators<K, M> => ({
  request: (payload) => ({ type: types.request, payload }),
  success: (payload) => ({ type: types.success, payload }),
  failure: (payload) => ({ type: types.failure, payload, error: true }),
  mistake: (payload) => ({ type: types.mistake, payload, error: true }),
  timeout: (payload) => ({ type: types.timeout, payload, error: true }),
  offline: (payload) => ({ type: types.offline, payload, error: true }),
});
