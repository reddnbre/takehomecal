export function assertClose(actual, expected, label, tolerance = 0.02) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label}: expected ${expected}, received ${actual}`);
  }
}

export function assert(condition, label) {
  if (!condition) throw new Error(label);
}
