import { calculateOvertime } from "../assets/js/overtime.js";
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
  otherPostTax: 25,
  overtimeMultiplier: 1.5
};

assertClose(calculateOvertime(profile, 0).extraTakeHome, 0, "zero overtime");

for (const hours of [4, 8, 12]) {
  const result = calculateOvertime(profile, hours);
  assertClose(result.grossOvertimePay, hours * 31 * 1.5, `${hours} hours gross overtime`);
  assert(result.extraTakeHome > 0, `${hours} hours extra take home`);
  assertClose(result.extraTakeHome, result.withOvertime.takeHome - result.normal.takeHome, `${hours} hours incremental calculation`);
}

const custom = calculateOvertime(profile, 6.5);
assertClose(custom.grossOvertimePay, 302.25, "custom hours gross overtime");

const pennsylvaniaOvertime = calculateOvertime({ ...profile, state: "PA" }, 8);
assert(
  pennsylvaniaOvertime.withOvertime.state > pennsylvaniaOvertime.normal.state,
  "overtime changes estimated state tax for taxable states"
);
