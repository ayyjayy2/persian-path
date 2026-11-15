// Numbers are taught in counting order until the learner knows them, then mixed (#56).
// Pure, so Node can test it (tests/unit/number-order.test.mjs).

// Known: every number word is in Leitner box 2 or higher (rated Good or Easy at least once)
export function numbersKnown(numberWords, srs) {
  return numberWords.every(w => ((srs || {})[w.key]?.b || 0) >= 2);
}

// Puts the number words of a list in counting order. Other words keep their places;
// the numbers fill the slots numbers held, smallest first.
export function countingOrder(list) {
  const slots = [], numbers = [];
  list.forEach((w, i) => { if (w.digit != null) { slots.push(i); numbers.push(w); } });
  numbers.sort((a, b) => a.digit - b.digit);
  const out = [...list];
  slots.forEach((slot, i) => { out[slot] = numbers[i]; });
  return out;
}
