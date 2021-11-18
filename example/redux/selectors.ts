import { createSelector } from "reselect";

import type { GetAverageInterestRatesResponse } from "../api/treasury/interestRates";
import type { RASCLState } from "./RASCL";

export const getAllAverageInterestRates = (
  state: RASCLState,
): GetAverageInterestRatesResponse["data"] => state.getAverageInterestRates.success?.data ?? [];

export const getOverallAverageInterestRate = createSelector(getAllAverageInterestRates, (rates) => {
  const sum: number = rates.reduce(
    (previous, current) => previous + Number(current.avg_interest_rate_amt),
    0,
  );

  return sum / rates.length;
});
