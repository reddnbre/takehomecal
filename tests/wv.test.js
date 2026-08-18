import { calculateWestVirginiaWithholding } from "../assets/tax/2026/states/wv.js";
import { assert, assertClose } from "./test-utils.mjs";

assertClose(calculateWestVirginiaWithholding({
  taxableWagesPerPeriod: 1000,
  payFrequency: "weekly",
  periodsPerYear: 52,
  exemptions: 1
}), 29.39, "weekly one-earner WV");

assertClose(calculateWestVirginiaWithholding({
  taxableWagesPerPeriod: 2480,
  payFrequency: "biweekly",
  periodsPerYear: 26,
  exemptions: 2
}), 75.86, "biweekly one-earner WV");

const one = calculateWestVirginiaWithholding({
  taxableWagesPerPeriod: 2500,
  payFrequency: "biweekly",
  periodsPerYear: 26,
  exemptions: 2
});
const two = calculateWestVirginiaWithholding({
  taxableWagesPerPeriod: 2500,
  payFrequency: "biweekly",
  periodsPerYear: 26,
  exemptions: 2,
  twoEarner: true
});
assert(two > one, "WV two-earner table withholds more");

assertClose(calculateWestVirginiaWithholding({
  taxableWagesPerPeriod: 6000,
  payFrequency: "monthly",
  periodsPerYear: 12,
  exemptions: 0
}), 208.34, "monthly high range WV");
