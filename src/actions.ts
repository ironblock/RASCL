import type { TimeoutError } from "ky";
import type { AsyncReturnType } from "type-fest";

import type {
  EnqueueType,
  RequestType,
  SuccessType,
  FailureType,
  MistakeType,
  TimeoutType,
  OfflineType,
  ActionTypeConstantsMap,
} from "./constants";
import type { FailureError, MistakeError, OfflineError } from "./errors";
import type {
  APICallNoParams,
  APIFunctionMap,
  EndpointStateMap,
  EnqueueParameters,
  GenericAPICall,
  RequestParameters,
} from "./types/API";
import type { RFSA, RFSE } from "./types/RFSA";

export interface ActionCreators<K extends string, M extends APIFunctionMap>
  extends EndpointStateMap {
  readonly enqueue: (req: EnqueueParameters<K, M>) => RFSA<EnqueueType<K>, typeof req>;
  readonly request: (req: RequestParameters<K, M>) => RFSA<RequestType<K>, typeof req>;
  readonly success: (res: AsyncReturnType<M[K]>) => RFSA<SuccessType<K>, typeof res>;
  readonly failure: (err: FailureError | Error) => RFSE<FailureType<K>, typeof err>;
  readonly mistake: (err: MistakeError | Error) => RFSE<MistakeType<K>, typeof err>;
  readonly timeout: (err: TimeoutError | Error) => RFSE<TimeoutType<K>, typeof err>;
  readonly offline: (err: OfflineError | Error) => RFSE<OfflineType<K>, typeof err>;
}

export type ActionCreatorsMap<M extends APIFunctionMap> = {
  [K in string & keyof M]: ActionCreators<K, M>;
};

export type ActionCreatorsPostEnqueue<K extends string, M extends APIFunctionMap> = Omit<
  ActionCreators<K, M>,
  "enqueue"
>;

export type ActionCreatorsPostEnqueueMap<M extends APIFunctionMap> = {
  [K in string & keyof M]: ActionCreatorsPostEnqueue<K, M>;
};

export type ActionCreatorsPostRequest<K extends string, M extends APIFunctionMap> = Omit<
  ActionCreators<K, M>,
  "enqueue" | "request"
>;

export type ActionCreatorsPostRequestMap<M extends APIFunctionMap> = {
  [K in string & keyof M]: ActionCreatorsPostRequest<K, M>;
};

export type ActionCreatorsPostOutcome<K extends string, M extends APIFunctionMap> = Omit<
  ActionCreators<K, M>,
  "success" | "failure" | "mistake" | "timeout" | "offline"
>;

export type ActionCreatorsPostOutcomeMap<M extends APIFunctionMap> = {
  [K in string & keyof M]: ActionCreatorsPostOutcome<K, M>;
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
