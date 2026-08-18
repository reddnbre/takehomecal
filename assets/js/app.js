import { wireCalculator, wireRaiseCalculator } from "./ui.js";

const calculator = document.getElementById("paycheckForm");
if (calculator) wireCalculator(calculator);

const raise = document.getElementById("raiseForm");
if (raise) wireRaiseCalculator(raise);
