import { calculatePaycheck } from "./paycheck.js";
import { calculateOvertime } from "./overtime.js";
import { clearProfile, loadProfile, saveProfile } from "./storage.js";
import { STATES, getStateName, getStateSupport } from "../tax/2026/states/index.js";

export const defaults = {
  payType: "hourly",
  hourlyRate: 31,
  regularHours: 40,
  annualSalary: 65000,
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
  retirementFixed: 0,
  healthInsurance: 120,
  hsa: 0,
  otherPreTax: 0,
  otherPostTax: 25,
  overtimeHours: 4,
  overtimeMultiplier: 1.5,
  remember: false
};

export const money = (value, sign = false) => {
  const formatted = Math.abs(value).toLocaleString("en-US", { style: "currency", currency: "USD" });
  if (!sign) return value < 0 ? `-${formatted}` : formatted;
  return `${value >= 0 ? "+" : "-"}${formatted}`;
};

const deductionMoney = (value) => Number(value) > 0.004 ? `-${money(value)}` : "$0.00";

const setText = (id, value) => {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
};

const inputValue = (form, name) => {
  const el = form.elements[name];
  if (!el) return undefined;
  if (el.type === "checkbox") return el.checked;
  return el.value;
};

function profileFromUrl(profile = defaults) {
  const params = new URLSearchParams(window.location.search);
  const state = params.get("state")?.toUpperCase();
  if (state && STATES.some(([code]) => code === state)) {
    return { ...profile, state };
  }
  return profile;
}

function populateStateSelects() {
  document.querySelectorAll('select[name="state"]').forEach((select) => {
    const current = select.value || defaults.state;
    select.replaceChildren(...STATES.map(([code, name]) => {
      const support = getStateSupport(code);
      const suffix = support === "official-withholding" ? " - official withholding" :
        support === "no-wage-income-tax" ? " - no state wage tax" :
          " - estimated state tax";
      return new Option(`${name}${suffix}`, code);
    }));
    select.value = STATES.some(([code]) => code === current) ? current : defaults.state;
  });
}

export function readProfile(form) {
  return {
    ...defaults,
    payType: inputValue(form, "payType"),
    hourlyRate: inputValue(form, "hourlyRate"),
    regularHours: inputValue(form, "regularHours"),
    annualSalary: inputValue(form, "annualSalary"),
    payFrequency: inputValue(form, "payFrequency"),
    state: inputValue(form, "state"),
    filingStatus: inputValue(form, "filingStatus"),
    step2: inputValue(form, "step2"),
    step3Credits: inputValue(form, "step3Credits"),
    step4aOtherIncome: inputValue(form, "step4aOtherIncome"),
    step4bDeductions: inputValue(form, "step4bDeductions"),
    step4cExtraWithholding: inputValue(form, "step4cExtraWithholding"),
    wvExemptions: inputValue(form, "wvExemptions"),
    retirementMode: inputValue(form, "retirementMode"),
    retirementPercent: inputValue(form, "retirementPercent"),
    retirementFixed: inputValue(form, "retirementFixed"),
    healthInsurance: inputValue(form, "healthInsurance"),
    hsa: inputValue(form, "hsa"),
    otherPreTax: inputValue(form, "otherPreTax"),
    otherPostTax: inputValue(form, "otherPostTax"),
    overtimeHours: inputValue(form, "overtimeHours"),
    overtimeMultiplier: inputValue(form, "overtimeMultiplier"),
    remember: inputValue(form, "remember")
  };
}

export function populateForm(form, profile) {
  populateStateSelects();
  Object.entries({ ...defaults, ...profile }).forEach(([key, value]) => {
    const el = form.elements[key];
    if (!el) return;
    if (el.type === "checkbox") el.checked = Boolean(value);
    else el.value = value;
  });
  togglePayType(form);
  toggleRetirementMode(form);
}

export function togglePayType(form) {
  const salary = form.elements.payType?.value === "salary";
  document.querySelectorAll("[data-hourly]").forEach((el) => el.hidden = salary);
  document.querySelectorAll("[data-salary]").forEach((el) => el.hidden = !salary);
}

export function toggleRetirementMode(form) {
  const fixed = form.elements.retirementMode?.value === "fixed";
  document.querySelectorAll("[data-retirement-percent]").forEach((el) => el.hidden = fixed);
  document.querySelectorAll("[data-retirement-fixed]").forEach((el) => el.hidden = !fixed);
}

function renderBreakdown(result) {
  setText("grossPay", money(result.grossPay));
  setText("federalTax", deductionMoney(result.federal));
  setText("socialSecurity", deductionMoney(result.fica.socialSecurity));
  setText("medicare", deductionMoney(result.fica.medicare + result.fica.additionalMedicare));
  if (result.stateSupport === "official-withholding") {
    setText("stateTaxLabel", `${result.stateName} Withholding`);
    setText("stateTax", deductionMoney(result.state));
  } else if (result.stateSupport === "no-wage-income-tax") {
    setText("stateTaxLabel", `${result.stateName} state wage tax`);
    setText("stateTax", "$0.00");
  } else {
    setText("stateTaxLabel", `Estimated ${result.stateName} income tax`);
    setText("stateTax", deductionMoney(result.state));
  }
  setText("retirementDeduction", deductionMoney(result.preTax.retirement));
  setText("healthDeduction", deductionMoney(result.preTax.health));
  setText("hsaDeduction", deductionMoney(result.preTax.hsa));
  setText("otherPreTaxDeduction", deductionMoney(result.preTax.other));
  setText("postTaxDeduction", deductionMoney(result.postTax.other));
  setText("takeHome", money(result.takeHome));
  setText("takeHomeFinal", money(result.takeHome));
}

function renderOvertime(profile, hours) {
  const ot = calculateOvertime(profile, hours);
  setText("normalTakeHome", money(ot.normal.takeHome));
  setText("withOvertimeTakeHome", money(ot.withOvertime.takeHome));
  setText("grossOvertime", money(ot.grossOvertimePay));
  setText("extraTakeHome", money(ot.extraTakeHome, true));
  setText("additionalWithholding", deductionMoney(Math.max(0, ot.additionalWithholding)));
  setText("effectiveOtHour", money(ot.effectivePerHour));
  [4, 8, 12].forEach((scenario) => {
    const result = calculateOvertime(profile, scenario);
    setText(`scenario${scenario}Extra`, money(result.extraTakeHome, true));
    setText(`scenario${scenario}Gross`, money(result.grossOvertimePay));
    setText(`scenario${scenario}Withholding`, deductionMoney(Math.max(0, result.additionalWithholding)));
    setText(`scenario${scenario}PerHour`, money(result.effectivePerHour));
  });
}

export function wireCalculator(form) {
  populateForm(form, profileFromUrl(loadProfile() || defaults));
  const recalc = () => {
    togglePayType(form);
    toggleRetirementMode(form);
    const profile = readProfile(form);
    const warnings = [];
    const support = getStateSupport(profile.state);
    if (support === "estimated-income-tax") {
      warnings.push(`${getStateName(profile.state)} uses estimated 2026 state income tax rates, not an employer withholding table. Local taxes are not included.`);
    }
    if (Number(profile.hourlyRate) < 0 || Number(profile.regularHours) < 0) warnings.push("Pay rates and hours cannot be negative.");
    setText("validationMessage", warnings.join(" "));
    renderBreakdown(calculatePaycheck(profile, 0));
    renderOvertime(profile, profile.overtimeHours);
    if (profile.remember) saveProfile(profile);
  };
  form.addEventListener("input", recalc);
  form.addEventListener("change", recalc);
  document.querySelectorAll(`[form="${form.id}"]`).forEach((control) => {
    control.addEventListener("input", recalc);
    control.addEventListener("change", recalc);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    recalc();
  });
  document.querySelectorAll("[data-hours]").forEach((button) => {
    button.addEventListener("click", () => {
      form.elements.overtimeHours.value = button.dataset.hours;
      recalc();
    });
  });
  document.querySelectorAll("[data-step-hours]").forEach((button) => {
    button.addEventListener("click", () => {
      form.elements.overtimeHours.value = Math.max(0, Number(form.elements.overtimeHours.value || 0) + Number(button.dataset.stepHours));
      recalc();
    });
  });
  document.getElementById("resetButton")?.addEventListener("click", () => {
    populateForm(form, defaults);
    recalc();
  });
  document.getElementById("clearSaved")?.addEventListener("click", () => {
    clearProfile();
    form.elements.remember.checked = false;
    recalc();
  });
  recalc();
}

export function wireRaiseCalculator(form) {
  populateForm(form, profileFromUrl(loadProfile() || defaults));
  const recalc = () => {
    const profile = readProfile(form);
    const current = calculatePaycheck({ ...profile, hourlyRate: form.elements.currentRate.value, annualSalary: form.elements.currentSalary.value }, 0);
    const next = calculatePaycheck({ ...profile, hourlyRate: form.elements.newRate.value, annualSalary: form.elements.newSalary.value }, 0);
    const increase = next.takeHome - current.takeHome;
    setText("raiseCurrent", money(current.takeHome));
    setText("raiseNew", money(next.takeHome));
    setText("raisePerPaycheck", money(increase, true));
    setText("raisePerMonth", money(increase * current.periods / 12, true));
    setText("raisePerYear", money(increase * current.periods, true));
  };
  form.addEventListener("input", recalc);
  form.addEventListener("change", recalc);
  form.elements.currentRate.value = form.elements.currentRate.value || defaults.hourlyRate;
  form.elements.newRate.value = form.elements.newRate.value || 35;
  form.elements.currentSalary.value = form.elements.currentSalary.value || defaults.annualSalary;
  form.elements.newSalary.value = form.elements.newSalary.value || 75000;
  recalc();
}
