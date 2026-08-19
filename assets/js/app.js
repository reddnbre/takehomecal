import { wireCalculator, wireRaiseCalculator } from "./ui.js";

const nav = document.querySelector(".nav");
if (nav && !nav.querySelector(".support-icon")) {
  const support = document.createElement("a");
  support.className = "support-icon";
  support.href = "https://www.buymeacoffee.com/reddnbre";
  support.target = "_blank";
  support.rel = "noopener";
  support.title = "Buy me a coffee";
  support.setAttribute("aria-label", "Buy me a coffee");
  support.textContent = "☕";
  nav.append(support);
}

const calculator = document.getElementById("paycheckForm");
if (calculator) wireCalculator(calculator);

const raise = document.getElementById("raiseForm");
if (raise) wireRaiseCalculator(raise);
