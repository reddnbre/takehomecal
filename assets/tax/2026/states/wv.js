export const TAX_YEAR = 2026;
export const SOURCE_URL = "https://tax.wv.gov/Documents/Withholding/it100.2a.pdf";

// WV IT-100.2.A (March 2026), annual percentage method tables.
export const WV_TABLES = {
  oneJob: {
    exemptionAmount: 2000,
    brackets: [
      [0, 10000, 0, 0.0211, 0],
      [10000, 25000, 211, 0.0281, 10000],
      [25000, 40000, 632.5, 0.0316, 25000],
      [40000, 60000, 1106.5, 0.0422, 40000],
      [60000, Infinity, 1950.5, 0.0458, 60000]
    ]
  },
  twoJobs: {
    exemptionAmount: 2000,
    brackets: [
      [0, 7500, 0, 0.0211, 0],
      [7500, 18750, 158.25, 0.0281, 7500],
      [18750, 30000, 474.38, 0.0316, 18750],
      [30000, 45000, 829.88, 0.0422, 30000],
      [45000, Infinity, 1462.88, 0.0458, 45000]
    ]
  }
};

export function calculateWestVirginiaWithholding({
  taxableWagesPerPeriod,
  payFrequency,
  periodsPerYear,
  exemptions = 0,
  twoEarner = false
}) {
  const table = twoEarner ? WV_TABLES.twoJobs : WV_TABLES.oneJob;
  const annualTaxableWage = Math.max(0, taxableWagesPerPeriod * periodsPerYear - exemptions * table.exemptionAmount);
  const row = table.brackets.find(([min, max]) => annualTaxableWage >= min && annualTaxableWage < max);
  const annualTax = row[2] + (annualTaxableWage - row[4]) * row[3];
  return Math.max(0, annualTax / periodsPerYear);
}
