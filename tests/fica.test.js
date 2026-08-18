import { calculateFica } from "../assets/tax/2026/fica.js";
import { assertClose } from "./test-utils.mjs";

const normal = calculateFica({ wagesPerPeriod: 2000, periodsPerYear: 26 });
assertClose(normal.socialSecurity, 124, "social security");
assertClose(normal.medicare, 29, "medicare");

const nearBase = calculateFica({ wagesPerPeriod: 2000, periodsPerYear: 26, yearToDateSocialSecurityWages: 184000 });
assertClose(nearBase.socialSecurity, 31, "social security wage base boundary");

const additional = calculateFica({ wagesPerPeriod: 2500, periodsPerYear: 26, yearToDateMedicareWages: 199000 });
assertClose(additional.additionalMedicare, 13.5, "additional medicare boundary");
