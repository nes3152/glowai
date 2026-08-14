/** `short` keeps chart axis labels readable at 11px. */
export const CONCERNS = [
  { id: 'acne', label: 'Acne & breakouts', short: 'Acne', emoji: '🔴' },
  { id: 'pores', label: 'Pores & texture', short: 'Pores', emoji: '🕳️' },
  { id: 'wrinkles', label: 'Fine lines', short: 'Lines', emoji: '〰️' },
  { id: 'dryness', label: 'Dryness', short: 'Dryness', emoji: '🏜️' },
  { id: 'oiliness', label: 'Excess oil', short: 'Oil', emoji: '💧' },
  { id: 'pigmentation', label: 'Dark spots', short: 'Spots', emoji: '🟤' },
  { id: 'redness', label: 'Redness', short: 'Redness', emoji: '🌡️' },
];

export const CONCERN_IDS = CONCERNS.map((c) => c.id);

export const SAFETY_FLAGS = [
  { id: 'pregnancy', label: 'Pregnant or breastfeeding' },
  { id: 'sensitive', label: 'Very sensitive / reactive skin' },
];

export const SAFETY_FLAG_IDS = SAFETY_FLAGS.map((f) => f.id);
