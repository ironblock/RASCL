import type { NormalizedOptions } from "ky";
import { HTTPError as KyHTTPError, TimeoutError as KyTimeoutError } from "ky";
import { Request as NodeRequest, Response as NodeResponse } from "node-fetch";

export const kyRequest = new NodeRequest("example.com") as unknown as Request;
export const kyOptions: NormalizedOptions = {
  method: "get",
  credentials: undefined,
  retry: {},
  prefixUrl: "",
  onDownloadProgress: undefined,
};

export const response500 = new NodeResponse(undefined, { status: 500 }) as unknown as Response;
export const response400 = new NodeResponse(undefined, { status: 400 }) as unknown as Response;

export const kyHTTPError500 = new KyHTTPError(response500, kyRequest, kyOptions);
export const kyHTTPError400 = new KyHTTPError(response400, kyRequest, kyOptions);
export const kyHTTPErrorUnknown: KyHTTPError = {
  ...kyHTTPError500,
  response: undefined,
  request: undefined,
} as unknown as KyHTTPError;
export const kyTimeoutError = new KyTimeoutError(kyRequest);
export const kyOfflineError = new KyHTTPError(
  { ...new NodeResponse(), status: 0, statusText: undefined } as unknown as Response,
  kyRequest,
  kyOptions,
);
