import { calculatePaycheck, getGrossPay } from "./paycheck.js";
import { normalizeMoney } from "./deductions.js";

export function calculateOvertime(profile, overtimeHours) {
  const hours = normalizeMoney(overtimeHours);
  const normal = calculatePaycheck(profile, 0);
  const withOvertime = calculatePaycheck(profile, hours);
  const grossOvertimePay = getGrossPay(profile, hours) - getGrossPay(profile, 0);
  const extraTakeHome = withOvertime.takeHome - normal.takeHome;
  const additionalWithholding = grossOvertimePay - extraTakeHome;
  return {
    hours,
    normal,
    withOvertime,
    grossOvertimePay,
    extraTakeHome,
    additionalWithholding,
    effectivePerHour: hours > 0 ? extraTakeHome / hours : 0
  };
}
