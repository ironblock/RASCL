import ky, { NormalizedOptions } from "ky";
import { Request as NodeRequest, Response as NodeResponse } from "node-fetch";

export const kyRequest = (new NodeRequest("example.com") as unknown) as Request;
export const kyOptions: NormalizedOptions = {
  method: "get",
  credentials: undefined,
  retry: {},
  prefixUrl: "",
  onDownloadProgress: undefined,
};

export const kyHTTPError500 = new ky.HTTPError(
  (new NodeResponse(undefined, { status: 500 }) as unknown) as Response,
  kyRequest,
  kyOptions,
);
export const makeKyHTTPError500 = () => {
  throw kyHTTPError500;
};

export const kyHTTPError400 = new ky.HTTPError(
  (new NodeResponse(undefined, { status: 400 }) as unknown) as Response,
  kyRequest,
  kyOptions,
);
export const makeKyHTTPError400 = () => {
  throw kyHTTPError400;
};

export const kyTimeoutError = new ky.TimeoutError(kyRequest);
export const makeKyTimeoutError = () => {
  throw kyTimeoutError;
};
export const kyOfflineError = new ky.HTTPError(
  ({ ...new NodeResponse(undefined), status: 0, statusText: undefined } as unknown) as Response,
  kyRequest,
  kyOptions,
);
export const makeKyOfflineError = () => {
  throw kyOfflineError;
};
