import {
  RequestType,
  SuccessType,
  FailureType,
  MistakeType,
  TimeoutType,
  OfflineType,
} from "./constants";
import { FetchResult, APIFunctionMap, GenericAPICall, EndpointStateMap } from "./types/API";
import { FSA, FSE } from "./types/FSA";

export interface ActionCreators<K extends string, F extends GenericAPICall>
  extends EndpointStateMap {
  readonly request: (req?: Parameters<F>) => FSA<RequestType<K>, typeof req>;
  readonly success: (res?: FetchResult<ReturnType<F>>) => FSA<SuccessType<K>, typeof res>;
  readonly failure: (err: Error) => FSE<FailureType<K>, typeof err>;
  readonly mistake: (err: Error) => FSE<MistakeType<K>, typeof err>;
  readonly timeout: (err: Error) => FSE<TimeoutType<K>, typeof err>;
  readonly offline: (err: Error) => FSE<OfflineType<K>, typeof err>;
}

export type ActionCreatorsMap<M extends APIFunctionMap> = {
  [K in string & keyof M]: ActionCreators<K, M[K]>;
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
export type UnknownAction<K extends string & keyof M, M extends APIFunctionMap> =
  | RequestAction<K, M>
  | SuccessAction<K, M>
  | FailureAction<K, M>
  | MistakeAction<K, M>
  | TimeoutAction<K, M>
  | OfflineAction<K, M>;
