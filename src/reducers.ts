import produce from "immer";
import { Reducer } from "redux";

import {
  FailureAction,
  MistakeAction,
  OfflineAction,
  EnqueueAction,
  RequestAction,
  SuccessAction,
  TimeoutAction,
} from "./actions";
import {
  FailureType,
  MistakeType,
  OfflineType,
  EnqueueType,
  RequestType,
  SuccessType,
  TimeoutType,
} from "./constants";
import { APIFunctionMap, EndpointState, EndpointStateMap } from "./types/API";
import { RFSA, RFSE } from "./types/RFSA";

export interface EndpointMetadata {
  isFetching: boolean;
  lastUpdate: number | null;
  lastResult: EndpointState | null;
}

export interface EndpointData<K extends string, M extends APIFunctionMap>
  extends EndpointStateMap,
    EndpointMetadata {
  enqueue: EnqueueAction<K, M>["payload"] | null;
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

export interface APIReducer<M extends APIFunctionMap> extends Reducer {
  (state: APIReducerState<M>, action: RFSA<string, any> | RFSE<string, Error>): APIReducerState<M>;
}

export type APIHandlerMap<M extends APIFunctionMap> = {
  [K: string]: APIReducer<M>;
} & {
  [ET in string as EnqueueType<ET>]: (
    draft: APIReducerState<M>,
    action: EnqueueAction<ET, M>,
  ) => void;
} &
  {
    [RT in string as RequestType<RT>]: (
      draft: APIReducerState<M>,
      action: RequestAction<RT, M>,
    ) => void;
  } &
  {
    [ST in string as SuccessType<ST>]: (
      draft: APIReducerState<M>,
      action: SuccessAction<ST, M>,
    ) => void;
  } &
  {
    [FT in string as FailureType<FT>]: (
      draft: APIReducerState<M>,
      action: FailureAction<FT, M>,
    ) => void;
  } &
  {
    [MT in string as MistakeType<MT>]: (
      draft: APIReducerState<M>,
      action: MistakeAction<MT, M>,
    ) => void;
  } &
  {
    [TT in string as TimeoutType<TT>]: (
      draft: APIReducerState<M>,
      action: TimeoutAction<TT, M>,
    ) => void;
  } &
  {
    [OT in string as OfflineType<OT>]: (
      draft: APIReducerState<M>,
      action: OfflineAction<OT, M>,
    ) => void;
  };

export const createReducer = <M extends APIFunctionMap>(
  handlerMap: APIHandlerMap<M>,
  initialState: APIReducerState<M>,
): APIReducer<M> => {
  return produce((state, action) => {
    if (typeof handlerMap[action.type] === "function") {
      handlerMap[action.type](state, action);
    }
  }, initialState);
};

export const initialEndpointState: EndpointData<any, any> = Object.freeze({
  enqueue: null,
  request: null,
  success: null,
  failure: null,
  mistake: null,
  timeout: null,
  offline: null,
  isFetching: false,
  lastUpdate: null,
  lastResult: null,
});

export const handleEnqueue = <K extends string & keyof M, M extends APIFunctionMap>(
  name: K,
  draft: APIReducerState<M>,
  action: EnqueueAction<K, M>,
): void => {
  draft[name].enqueue = action.payload;
  draft[name].request = null;
  draft[name].isFetching = true;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "enqueue";
};

export const handleRequest = <K extends string & keyof M, M extends APIFunctionMap>(
  name: K,
  draft: APIReducerState<M>,
  action: RequestAction<K, M>,
): void => {
  draft[name].enqueue = null;
  draft[name].request = action.payload;
  draft[name].isFetching = true;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "request";
};

export const handleSuccess = <K extends string & keyof M, M extends APIFunctionMap>(
  name: K,
  draft: APIReducerState<M>,
  action: SuccessAction<K, M>,
): void => {
  draft[name].success = action.payload ?? null;
  draft[name].isFetching = false;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "success";
};

export const handleFailure = <K extends string & keyof M, M extends APIFunctionMap>(
  name: K,
  draft: APIReducerState<M>,
  action: FailureAction<K, M>,
): void => {
  draft[name].failure = action.payload ?? null;
  draft[name].mistake = null;
  draft[name].timeout = null;
  draft[name].offline = null;
  draft[name].isFetching = false;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "failure";
};
export const handleMistake = <K extends string & keyof M, M extends APIFunctionMap>(
  name: K,
  draft: APIReducerState<M>,
  action: MistakeAction<K, M>,
): void => {
  draft[name].failure = null;
  draft[name].mistake = action.payload ?? null;
  draft[name].timeout = null;
  draft[name].offline = null;
  draft[name].isFetching = false;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "mistake";
};

export const handleTimeout = <K extends string & keyof M, M extends APIFunctionMap>(
  name: K,
  draft: APIReducerState<M>,
  action: TimeoutAction<K, M>,
): void => {
  draft[name].failure = null;
  draft[name].mistake = null;
  draft[name].timeout = action.payload ?? null;
  draft[name].offline = null;
  draft[name].isFetching = false;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "timeout";
};

export const handleOffline = <K extends string & keyof M, M extends APIFunctionMap>(
  name: K,
  draft: APIReducerState<M>,
  action: OfflineAction<K, M>,
): void => {
  draft[name].failure = null;
  draft[name].mistake = null;
  draft[name].timeout = null;
  draft[name].offline = action.payload ?? null;
  draft[name].isFetching = false;
  draft[name].lastUpdate = Date.now();
  draft[name].lastResult = "offline";
};
