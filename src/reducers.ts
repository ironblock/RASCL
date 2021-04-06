import { Reducer } from "redux";
import {
  FailureAction,
  MistakeAction,
  OfflineAction,
  RequestAction,
  SuccessAction,
  TimeoutAction,
  UnknownAction,
} from "./actions";
import {
  FailureType,
  MistakeType,
  OfflineType,
  RequestType,
  SuccessType,
  TimeoutType,
} from "./constants";
import { APIFunctionMap, EndpointState, EndpointStateMap } from "./types/API";
import { FSA, FSE } from "./types/FSA";

export interface EndpointMetadata {
  isFetching: boolean;
  lastUpdate: number | null;
  lastResult: EndpointState | null;
}

export interface EndpointData<K extends string, M extends APIFunctionMap>
  extends EndpointStateMap,
    EndpointMetadata {
  request: RequestAction<K, M>["payload"] | null;
  success: SuccessAction<K, M>["payload"] | null;
  failure: FailureAction<K, M>["payload"] | null;
  mistake: MistakeAction<K, M>["payload"] | null;
  timeout: TimeoutAction<K, M>["payload"] | null;
  offline: OfflineAction<K, M>["payload"] | null;
}

export type APIReducerState<M extends APIFunctionMap> = {
  [K in string & keyof M]: EndpointData<K, M>;
};

export type APIHandlerMap<M extends APIFunctionMap, R extends APIReducerState<M>> = {
  [K in string & keyof M as RequestType<K>]: (name: K, draft: R, A: RequestAction<K, M>) => void;
} &
  {
    [K in string & keyof M as SuccessType<K>]: (name: K, draft: R, A: SuccessAction<K, M>) => void;
  } &
  {
    [K in string & keyof M as FailureType<K>]: (name: K, draft: R, A: FailureAction<K, M>) => void;
  } &
  {
    [K in string & keyof M as MistakeType<K>]: (name: K, draft: R, A: MistakeAction<K, M>) => void;
  } &
  {
    [K in string & keyof M as TimeoutType<K>]: (name: K, draft: R, A: TimeoutAction<K, M>) => void;
  } &
  {
    [K in string & keyof M as OfflineType<K>]: (name: K, draft: R, A: OfflineAction<K, M>) => void;
  };

export const initialEndpointState: EndpointData<any, any> = {
  request: null,
  success: null,
  failure: null,
  mistake: null,
  timeout: null,
  offline: null,
  isFetching: false,
  lastUpdate: null,
  lastResult: null,
};

export type ActionHandler = <
  K extends string & keyof M,
  M extends APIFunctionMap,
  R extends APIReducerState<M>,
  A extends FSA<any, any, any> & FSE<any, any, any>
>(
  name: K,
  draft: R,
  action: A,
) => void;

export const handleRequest: ActionHandler = <
  K extends string & keyof M,
  M extends APIFunctionMap,
  R extends APIReducerState<M>,
  A extends RequestAction<K, M>
>(
  name: K,
  draft: R,
  action: A,
): void => {
  draft[name].request = action.payload;
  draft[name].isFetching = true;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "request";
};

export const handleSuccess: ActionHandler = <
  K extends string & keyof M,
  M extends APIFunctionMap,
  R extends APIReducerState<M>,
  A extends SuccessAction<K, M>
>(
  name: K,
  draft: R,
  action: A,
): void => {
  draft[name].success = action.payload ?? null;
  draft[name].isFetching = false;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "success";
};

export const handleFailure: ActionHandler = <
  K extends string & keyof M,
  M extends APIFunctionMap,
  R extends APIReducerState<M>,
  A extends FailureAction<K, M>
>(
  name: K,
  draft: R,
  action: A,
): void => {
  draft[name].failure = action.payload ?? null;
  draft[name].isFetching = false;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "failure";
};
export const handleMistake: ActionHandler = <
  K extends string & keyof M,
  M extends APIFunctionMap,
  R extends APIReducerState<M>,
  A extends MistakeAction<K, M>
>(
  name: K,
  draft: R,
  action: A,
): void => {
  draft[name].mistake = action.payload ?? null;
  draft[name].isFetching = false;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "mistake";
};

export const handleTimeout: ActionHandler = <
  K extends string & keyof M,
  M extends APIFunctionMap,
  R extends APIReducerState<M>,
  A extends TimeoutAction<K, M>
>(
  name: K,
  draft: R,
  action: A,
): void => {
  draft[name].timeout = action.payload ?? null;
  draft[name].isFetching = false;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "timeout";
};

export const handleOffline: ActionHandler = <
  K extends string & keyof M,
  M extends APIFunctionMap,
  R extends APIReducerState<M>,
  A extends OfflineAction<K, M>
>(
  name: K,
  draft: R,
  action: A,
): void => {
  draft[name].offline = action.payload ?? null;
  draft[name].isFetching = false;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "offline";
};
