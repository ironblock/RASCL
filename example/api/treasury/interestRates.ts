import type { ConstraintParameters } from "./index";
import { Treasury, buildParams } from "./index";

/**
 * [GET] Get Quotes
 *
 * Get a list of symbols using a keyword lookup on the symbols description.
 * Results are in descending order by average volume of the security. This can
 * be used for simple search functions.
 */
export type Security =
  | "Domestic Series"
  | "Federal Financing Bank"
  | "Foreign Series"
  | "Government Account Series"
  | "R.E.A. Series"
  | "Security Description"
  | "State and Local Government Series"
  | "String"
  | "STRING"
  | "Total Interest-bearing Debt"
  | "Total Marketable"
  | "Total Non-marketable"
  | "Treasury Bills"
  | "Treasury Bonds"
  | "Treasury Inflation-Indexed Bonds"
  | "Treasury Inflation-Indexed Notes"
  | "Treasury Notes"
  | "United States Savings Inflation Securities"
  | "United States Savings Securities";

export interface InterestRateData {
  avg_interest_rate_amt?: string;
  record_calendar_day?: string;
  record_calendar_month?: string;
  record_calendar_quarter?: string;
  record_calendar_year?: string;
  record_date?: string;
  record_fiscal_quarter?: string;
  record_fiscal_year?: string;
  security_desc?: Security;
  security_type_desc?: string;
  src_line_nbr?: string;
}

export interface GetAverageInterestRatesResponse {
  data: InterestRateData[];
}

export const getAverageInterestRates = async (
  searchParams?: ConstraintParameters,
): Promise<GetAverageInterestRatesResponse> =>
  await Treasury.get("v2/accounting/od/avg_interest_rates", {
    searchParams: buildParams(searchParams),
  }).json();
