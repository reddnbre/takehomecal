import { calculateFederalWithholding } from "../assets/tax/2026/federal.js";
import { assert, assertClose } from "./test-utils.mjs";

assertClose(calculateFederalWithholding({
  taxableWagesPerPeriod: 1000,
  payFrequency: "weekly",
  filingStatus: "single"
}), 97.92, "single weekly federal");

assertClose(calculateFederalWithholding({
  taxableWagesPerPeriod: 2480,
  payFrequency: "biweekly",
  filingStatus: "married",
  step3Credits: 4000
}), 35.60, "married credits federal");

const standard = calculateFederalWithholding({
  taxableWagesPerPeriod: 2500,
  payFrequency: "biweekly",
  filingStatus: "married"
});
const step2 = calculateFederalWithholding({
  taxableWagesPerPeriod: 2500,
  payFrequency: "biweekly",
  filingStatus: "married",
  step2: true
});
assert(step2 > standard, "step 2 checkbox increases withholding");

const adjusted = calculateFederalWithholding({
  taxableWagesPerPeriod: 1800,
  payFrequency: "semimonthly",
  filingStatus: "head",
  step4aOtherIncome: 5000,
  step4bDeductions: 2000,
  step4cExtraWithholding: 25
});
assertClose(adjusted, 163.50, "head step 4 federal");
