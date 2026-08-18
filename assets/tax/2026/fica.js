export const TAX_YEAR = 2026;
export const SOURCE_URL = "https://www.irs.gov/publications/p15";

export const FICA_2026 = {
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 184500,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: 200000
};

export function calculateFica({ wagesPerPeriod, periodsPerYear, yearToDateSocialSecurityWages = 0, yearToDateMedicareWages = 0 }) {
  const annualizedWages = wagesPerPeriod * periodsPerYear;
  const projectedSsRemaining = Math.max(0, FICA_2026.socialSecurityWageBase - yearToDateSocialSecurityWages);
  const ssTaxableThisPeriod = Math.min(wagesPerPeriod, projectedSsRemaining, Math.max(0, annualizedWages) / periodsPerYear);
  const socialSecurity = Math.max(0, ssTaxableThisPeriod) * FICA_2026.socialSecurityRate;

  const medicare = Math.max(0, wagesPerPeriod) * FICA_2026.medicareRate;
  const previousMedicare = yearToDateMedicareWages;
  const currentMedicare = previousMedicare + wagesPerPeriod;
  const additionalTaxable = Math.max(0, currentMedicare - FICA_2026.additionalMedicareThreshold) -
    Math.max(0, previousMedicare - FICA_2026.additionalMedicareThreshold);
  const additionalMedicare = additionalTaxable * FICA_2026.additionalMedicareRate;

  return { socialSecurity, medicare, additionalMedicare, total: socialSecurity + medicare + additionalMedicare };
}
