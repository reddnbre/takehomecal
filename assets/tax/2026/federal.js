export const TAX_YEAR = 2026;
export const SOURCE_URL = "https://www.irs.gov/publications/p15t";

export const PAY_PERIODS = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12
};

// IRS Publication 15-T (2026), Percentage Method Tables for Automated Payroll Systems.
export const FEDERAL_TABLES = {
  standard: {
    married: [
      [0, 19300, 0, 0, 0],
      [19300, 44100, 0, 0.10, 19300],
      [44100, 120100, 2480, 0.12, 44100],
      [120100, 230700, 11600, 0.22, 120100],
      [230700, 422850, 35932, 0.24, 230700],
      [422850, 531750, 82048, 0.32, 422850],
      [531750, 788000, 116896, 0.35, 531750],
      [788000, Infinity, 206583.5, 0.37, 788000]
    ],
    single: [
      [0, 7500, 0, 0, 0],
      [7500, 19900, 0, 0.10, 7500],
      [19900, 57900, 1240, 0.12, 19900],
      [57900, 113200, 5800, 0.22, 57900],
      [113200, 209275, 17966, 0.24, 113200],
      [209275, 263725, 41024, 0.32, 209275],
      [263725, 648100, 58448, 0.35, 263725],
      [648100, Infinity, 192979.25, 0.37, 648100]
    ],
    head: [
      [0, 15550, 0, 0, 0],
      [15550, 33250, 0, 0.10, 15550],
      [33250, 83000, 1770, 0.12, 33250],
      [83000, 121250, 7740, 0.22, 83000],
      [121250, 217300, 16155, 0.24, 121250],
      [217300, 271750, 39207, 0.32, 217300],
      [271750, 656150, 56631, 0.35, 271750],
      [656150, Infinity, 191171, 0.37, 656150]
    ]
  },
  step2: {
    married: [
      [0, 16100, 0, 0, 0],
      [16100, 28500, 0, 0.10, 16100],
      [28500, 66500, 1240, 0.12, 28500],
      [66500, 121800, 5800, 0.22, 66500],
      [121800, 217875, 17966, 0.24, 121800],
      [217875, 272325, 41024, 0.32, 217875],
      [272325, 400450, 58448, 0.35, 272325],
      [400450, Infinity, 103291.75, 0.37, 400450]
    ],
    single: [
      [0, 8050, 0, 0, 0],
      [8050, 14250, 0, 0.10, 8050],
      [14250, 33250, 620, 0.12, 14250],
      [33250, 60900, 2900, 0.22, 33250],
      [60900, 108938, 8983, 0.24, 60900],
      [108938, 136163, 20512, 0.32, 108938],
      [136163, 328350, 29224, 0.35, 136163],
      [328350, Infinity, 96489.63, 0.37, 328350]
    ],
    head: [
      [0, 12075, 0, 0, 0],
      [12075, 20925, 0, 0.10, 12075],
      [20925, 45800, 885, 0.12, 20925],
      [45800, 64925, 3870, 0.22, 45800],
      [64925, 112950, 8077.5, 0.24, 64925],
      [112950, 140175, 19603.5, 0.32, 112950],
      [140175, 332375, 28315.5, 0.35, 140175],
      [332375, Infinity, 95585.5, 0.37, 332375]
    ]
  }
};

const filingKey = (filingStatus) => {
  if (filingStatus === "married") return "married";
  if (filingStatus === "head") return "head";
  return "single";
};

export function calculateFederalWithholding({
  taxableWagesPerPeriod,
  payFrequency,
  filingStatus,
  step2 = false,
  step3Credits = 0,
  step4aOtherIncome = 0,
  step4bDeductions = 0,
  step4cExtraWithholding = 0
}) {
  const periods = PAY_PERIODS[payFrequency] || 26;
  const tableSet = step2 ? FEDERAL_TABLES.step2 : FEDERAL_TABLES.standard;
  const adjustedAnnualWage = Math.max(
    0,
    taxableWagesPerPeriod * periods + step4aOtherIncome - step4bDeductions
  );
  const row = tableSet[filingKey(filingStatus)].find(([min, max]) => adjustedAnnualWage >= min && adjustedAnnualWage < max);
  const annualWithholding = row[2] + (adjustedAnnualWage - row[4]) * row[3];
  return Math.max(0, annualWithholding / periods - step3Credits / periods) + step4cExtraWithholding;
}
