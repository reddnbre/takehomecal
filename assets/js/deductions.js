export function normalizeMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

export function normalizePercent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 0;
}

export function calculatePreTaxDeductions(grossPay, profile) {
  const retirement = profile.retirementMode === "fixed"
    ? normalizeMoney(profile.retirementFixed)
    : grossPay * (normalizePercent(profile.retirementPercent) / 100);
  const health = normalizeMoney(profile.healthInsurance);
  const hsa = normalizeMoney(profile.hsa);
  const other = normalizeMoney(profile.otherPreTax);
  return {
    retirement,
    health,
    hsa,
    other,
    total: retirement + health + hsa + other
  };
}

export function calculatePostTaxDeductions(profile) {
  const other = normalizeMoney(profile.otherPostTax);
  return { other, total: other };
}
