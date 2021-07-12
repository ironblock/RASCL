import ky from "ky";

export const Treasury = ky.create({
  prefixUrl: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/",
  headers: {
    accept: "application/json",
  },
});

export type FilterOperator =
  | "lt" //  Less than
  | "lte" // Less than or equal to
  | "gt" //  Greater than
  | "gte" // Greater than or equal to
  | "eq" //  Equal to
  | "in"; // Contained in a given set
export type FilterDefinition = [string, FilterOperator, string];

export type ConstraintParameters = {
  sort?: Parameters<typeof sort>[0];
  filter?: Parameters<typeof filter>[0];
} & ParamMap;

export const sort = <T>(input: Array<keyof T | string>): string => input.join(",");

export const filter = (input: FilterDefinition[]): string =>
  input.map((entry) => entry.join(":")).join(",");

export const fields = <T>(input: Array<keyof T | string>): string => input.join(",");

export const supportedParameters = ["filter", "sort", "fields", "format"] as const;
export type Parameter = typeof supportedParameters[number];
export type QueryParameters = Partial<Record<Parameter, string>>;
export type ParamMap = {
  [key in Parameter]?: any;
};

export const transforms: ParamMap = {
  sort,
  filter,
  fields,
};

export const buildParams = (
  input?: ConstraintParameters,
): { [key: string]: string } | undefined => {
  let params: { [key: string]: string } | undefined;

  // FIXME: It would be great if this could be typed as QueryParameters, but
  // TS is freaking out about index signatures
  if (typeof input !== "undefined") {
    supportedParameters.forEach((parameter) => {
      if (typeof input[parameter] !== "undefined") {
        params = {
          ...params,
          [parameter]: transforms[parameter](input[parameter]),
        };
      }
    });
  }

  return params;
};
