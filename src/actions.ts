import { AsyncReturnType } from "type-fest";
import {
  EnqueueType,
  RequestType,
  SuccessType,
  FailureType,
  MistakeType,
  TimeoutType,
  OfflineType,
  ActionTypeConstantsMap,
} from "./constants";
import { APICallNoParams, APIFunctionMap, EndpointStateMap, GenericAPICall } from "./types/API";
import { RFSA, RFSE } from "./types/RFSA";
import { Tail } from "typescript-tuple";
import { First } from "typescript-tuple";

export type EnqueueParameters<K extends string & keyof M, M extends APIFunctionMap> = Tail<
  Parameters<M[K]>
>;
export type RequestParameters<K extends string & keyof M, M extends APIFunctionMap> =
  | Parameters<M[K]>
  | [First<Parameters<M[K]> & [any, ...any[]]>, ...EnqueueParameters<K, M>];

export interface ActionCreators<K extends string, M extends APIFunctionMap>
  extends EndpointStateMap {
  readonly enqueue: (req: EnqueueParameters<K, M>) => RFSA<EnqueueType<K>, typeof req>;
  readonly request: (req: RequestParameters<K, M>) => RFSA<RequestType<K>, typeof req>;
  readonly success: (res: AsyncReturnType<M[K]>) => RFSA<SuccessType<K>, typeof res>;
  readonly failure: (err: Error) => RFSE<FailureType<K>, typeof err>;
  readonly mistake: (err: Error) => RFSE<MistakeType<K>, typeof err>;
  readonly timeout: (err: Error) => RFSE<TimeoutType<K>, typeof err>;
  readonly offline: (err: Error) => RFSE<OfflineType<K>, typeof err>;
}

export type ActionCreatorsMap<M extends APIFunctionMap> = {
  [K in string & keyof M]: ActionCreators<K, M>;
};

export type EnqueueAction<K extends string & keyof M, M extends APIFunctionMap> = ReturnType<
  ActionCreatorsMap<M>[K]["enqueue"]
>;
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
  enqueue: (payload) => ({ type: types.enqueue, payload }),
  request: (payload) => ({ type: types.request, payload }),
  success: (payload) => ({ type: types.success, payload }),
  failure: (payload) => ({ type: types.failure, payload, error: true }),
  mistake: (payload) => ({ type: types.mistake, payload, error: true }),
  timeout: (payload) => ({ type: types.timeout, payload, error: true }),
  offline: (payload) => ({ type: types.offline, payload, error: true }),
});

export const doesNotUseParams = (
  request: GenericAPICall,
  params?: any[],
): request is APICallNoParams => {
  if (Array.isArray(params) && params.length > 0) {
    return false;
  } else {
    return true;
  }
};
