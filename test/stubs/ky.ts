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

export const response500 = (new NodeResponse(undefined, { status: 500 }) as unknown) as Response;
export const response400 = (new NodeResponse(undefined, { status: 400 }) as unknown) as Response;

export const kyHTTPError500 = new ky.HTTPError(response500, kyRequest, kyOptions);
export const kyHTTPError400 = new ky.HTTPError(response400, kyRequest, kyOptions);
export const kyHTTPErrorUnknown: ky.HTTPError = ({
  ...kyHTTPError500,
  response: undefined,
  request: undefined,
} as unknown) as ky.HTTPError;
export const kyTimeoutError = new ky.TimeoutError(kyRequest);
export const kyOfflineError = new ky.HTTPError(
  ({ ...new NodeResponse(), status: 0, statusText: undefined } as unknown) as Response,
  kyRequest,
  kyOptions,
);

export const makeKyHTTPError500 = () => {
  throw kyHTTPError500;
};
export const makeKyHTTPError400 = () => {
  throw kyHTTPError400;
};
export const makeKyHTTPErrorUnknown = () => {
  throw kyHTTPErrorUnknown;
};
export const makeKyTimeoutError = () => {
  throw kyTimeoutError;
};
export const makeKyOfflineError = () => {
  throw kyOfflineError;
};
