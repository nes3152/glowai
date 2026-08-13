export const CONCERNS = [
  { id: 'acne', label: 'Acne & breakouts', emoji: '🔴' },
  { id: 'pores', label: 'Pores & texture', emoji: '🕳️' },
  { id: 'wrinkles', label: 'Fine lines', emoji: '〰️' },
  { id: 'dryness', label: 'Dryness', emoji: '🏜️' },
  { id: 'oiliness', label: 'Excess oil', emoji: '💧' },
  { id: 'pigmentation', label: 'Dark spots', emoji: '🟤' },
  { id: 'redness', label: 'Redness', emoji: '🌡️' },
];

export const CONCERN_IDS = CONCERNS.map((c) => c.id);

export const SAFETY_FLAGS = [
  { id: 'pregnancy', label: 'Pregnant or breastfeeding' },
  { id: 'sensitive', label: 'Very sensitive / reactive skin' },
];

export const SAFETY_FLAG_IDS = SAFETY_FLAGS.map((f) => f.id);
