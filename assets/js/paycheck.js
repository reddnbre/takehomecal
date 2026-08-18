import { PAY_PERIODS, calculateFederalWithholding } from "../tax/2026/federal.js";
import { calculateFica } from "../tax/2026/fica.js";
import { getStateName, getStateSupport } from "../tax/2026/states/index.js";
import { STATE_INCOME_TAX } from "../tax/2026/states/state-income-tax.js";
import { calculateWestVirginiaWithholding } from "../tax/2026/states/wv.js";
import { calculatePostTaxDeductions, calculatePreTaxDeductions, normalizeMoney } from "./deductions.js";

export function getGrossPay(profile, extraOvertimeHours = 0) {
  const periods = PAY_PERIODS[profile.payFrequency] || 26;
  if (profile.payType === "salary") return normalizeMoney(profile.annualSalary) / periods;
  const rate = normalizeMoney(profile.hourlyRate);
  const regular = normalizeMoney(profile.regularHours);
  const overtime = normalizeMoney(extraOvertimeHours) * rate * normalizeMoney(profile.overtimeMultiplier || 1.5);
  return rate * regular + overtime;
}

function calculateMarginalTax(taxableIncome, brackets) {
  if (!brackets?.length || taxableIncome <= 0) return 0;
  return brackets.reduce((tax, [threshold, rate], index) => {
    const nextThreshold = brackets[index + 1]?.[0] ?? Infinity;
    const amountInBracket = Math.max(0, Math.min(taxableIncome, nextThreshold) - threshold);
    return tax + amountInBracket * rate;
  }, 0);
}

function calculateEstimatedStateIncomeTax({ state, taxableWagesPerPeriod, periods, filingStatus, exemptions = 0 }) {
  const data = STATE_INCOME_TAX[state];
  if (!data) return 0;
  const married = filingStatus === "married";
  const brackets = married ? data.married : data.single;
  if (!brackets.length) return 0;
  const annualWages = taxableWagesPerPeriod * periods;
  const standardDeduction = married ? data.standardDeductionMarried : data.standardDeductionSingle;
  const personalExemption = married ? data.exemptionMarried : data.exemptionSingle;
  const personalCredit = married ? data.creditMarried : data.creditSingle;
  const dependentCount = Math.max(0, normalizeMoney(exemptions) - (married ? 2 : 1));
  const taxableIncome = Math.max(0, annualWages - standardDeduction - personalExemption - dependentCount * data.dependentExemption);
  const annualTax = Math.max(0, calculateMarginalTax(taxableIncome, brackets) - personalCredit - dependentCount * data.dependentCredit);
  return annualTax / periods;
}

export function calculatePaycheck(profile, extraOvertimeHours = 0) {
  const periods = PAY_PERIODS[profile.payFrequency] || 26;
  const grossPay = getGrossPay(profile, extraOvertimeHours);
  const preTax = calculatePreTaxDeductions(grossPay, profile);
  const postTax = calculatePostTaxDeductions(profile);
  const taxableWages = Math.max(0, grossPay - preTax.total);
  const federal = calculateFederalWithholding({
    taxableWagesPerPeriod: taxableWages,
    payFrequency: profile.payFrequency,
    filingStatus: profile.filingStatus,
    step2: Boolean(profile.step2),
    step3Credits: normalizeMoney(profile.step3Credits),
    step4aOtherIncome: normalizeMoney(profile.step4aOtherIncome),
    step4bDeductions: normalizeMoney(profile.step4bDeductions),
    step4cExtraWithholding: normalizeMoney(profile.step4cExtraWithholding)
  });
  const fica = calculateFica({ wagesPerPeriod: taxableWages, periodsPerYear: periods });
  const stateSupport = getStateSupport(profile.state);
  const state = stateSupport === "official-withholding"
    ? calculateWestVirginiaWithholding({
      taxableWagesPerPeriod: taxableWages,
      payFrequency: profile.payFrequency,
      periodsPerYear: periods,
      exemptions: normalizeMoney(profile.wvExemptions),
      twoEarner: Boolean(profile.step2)
    })
    : calculateEstimatedStateIncomeTax({
      state: profile.state,
      taxableWagesPerPeriod: taxableWages,
      periods,
      filingStatus: profile.filingStatus,
      exemptions: profile.wvExemptions
    });
  const taxes = federal + fica.total + state;
  const takeHome = Math.max(0, grossPay - preTax.total - taxes - postTax.total);
  return {
    grossPay,
    preTax,
    postTax,
    taxableWages,
    federal,
    fica,
    state,
    stateName: getStateName(profile.state),
    stateSupport,
    stateIncluded: true,
    taxes,
    takeHome,
    periods
  };
}
