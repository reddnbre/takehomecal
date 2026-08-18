import { calculatePaycheck } from "../assets/js/paycheck.js";
import { assert, assertClose } from "./test-utils.mjs";

const profile = {
  payType: "hourly",
  hourlyRate: 31,
  regularHours: 40,
  payFrequency: "biweekly",
  state: "WV",
  filingStatus: "married",
  step2: false,
  step3Credits: 4000,
  step4aOtherIncome: 0,
  step4bDeductions: 0,
  step4cExtraWithholding: 0,
  wvExemptions: 2,
  retirementMode: "percent",
  retirementPercent: 6,
  healthInsurance: 120,
  hsa: 0,
  otherPreTax: 0,
  otherPostTax: 25
};

const result = calculatePaycheck(profile);
assertClose(result.grossPay, 1240, "gross paycheck");
assert(result.takeHome > 0, "take home positive");
assertClose(result.preTax.retirement, 74.4, "401k percent deduction");
assert(result.stateSupport === "official-withholding", "WV uses official withholding path");

const salary = calculatePaycheck({ ...profile, payType: "salary", annualSalary: 65000 });
assertClose(salary.grossPay, 2500, "salary gross paycheck");

const texas = calculatePaycheck({ ...profile, state: "TX" });
assertClose(texas.state, 0, "Texas state withholding");
assert(texas.stateIncluded, "Texas state withholding included as zero wage-income-tax state");
assert(texas.stateSupport === "no-wage-income-tax", "Texas uses no wage-income-tax path");

const pennsylvania = calculatePaycheck({ ...profile, state: "PA" });
assert(pennsylvania.state > 0, "Pennsylvania estimated state tax");
assert(pennsylvania.stateIncluded, "Pennsylvania state estimate included");
assert(pennsylvania.stateSupport === "estimated-income-tax", "Pennsylvania uses estimated state-tax path");
assert(pennsylvania.takeHome < texas.takeHome, "state estimate is included in take-home pay");
