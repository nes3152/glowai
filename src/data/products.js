/**
 * Static demo catalog. Prices are stored as numbers plus a currency so the app
 * never parses money out of display strings; a real build should load this from
 * an API where price and availability can change.
 *
 * targets: concern ids the product helps with.
 * ingredients: normalized ingredient ids used by the contraindication rules.
 * retailers: which storefronts stock the brand, for the buy links (Olive Young
 *   Global only lists K-beauty brands, so western brands are Amazon-only).
 * openBeautyFactsCode: barcode used to pull the full INCI list from Open Beauty
 *   Facts. Most K-beauty products are missing there, so it is optional and the
 *   catalog stays the source of truth for matching.
 */
export const ROUTINE_STEPS = [
  { id: 'cleanser', label: 'Cleanser', essential: true },
  { id: 'toner', label: 'Toner', essential: false },
  { id: 'serum', label: 'Serum', essential: false },
  { id: 'moisturizer', label: 'Moisturizer', essential: true },
  { id: 'spf', label: 'SPF', essential: true },
];

export const COSMETICS = [
  {
    id: 'cosrx-low-ph-cleanser',
    step: 'cleanser',
    name: 'COSRX Low pH Good Morning Gel Cleanser',
    brand: 'COSRX',
    price: { amount: 12, currency: 'USD' },
    targets: ['oiliness', 'acne'],
    ingredients: ['bha'],
    emoji: '🧴',
    badge: 'K-Beauty',
    retailers: ['amazon', 'oliveyoung'],
    openBeautyFactsCode: '8809416470511',
  },
  {
    id: 'cerave-hydrating-cleanser',
    step: 'cleanser',
    name: 'CeraVe Hydrating Facial Cleanser',
    brand: 'CeraVe',
    price: { amount: 6, currency: 'USD' },
    targets: ['dryness', 'redness'],
    ingredients: ['ceramide'],
    emoji: '🧼',
    badge: 'Best Value',
    retailers: ['amazon'],
    openBeautyFactsCode: '3606000537675',
  },
  {
    id: 'somebymi-miracle-toner',
    step: 'toner',
    name: 'Some By Mi AHA BHA PHA 30 Days Miracle Toner',
    brand: 'Some By Mi',
    price: { amount: 18, currency: 'USD' },
    targets: ['pores', 'acne'],
    ingredients: ['aha', 'bha'],
    emoji: '💧',
    badge: 'K-Beauty',
    retailers: ['amazon', 'oliveyoung'],
  },
  {
    id: 'klairs-supple-toner',
    step: 'toner',
    name: 'Klairs Supple Preparation Unscented Toner',
    brand: 'Klairs',
    price: { amount: 14, currency: 'USD' },
    targets: ['dryness', 'redness'],
    ingredients: ['hyaluronic-acid'],
    emoji: '🫧',
    badge: 'Fragrance-free',
    retailers: ['amazon', 'oliveyoung'],
  },
  {
    id: 'ordinary-niacinamide',
    step: 'serum',
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    price: { amount: 7, currency: 'USD' },
    targets: ['oiliness', 'pigmentation', 'pores'],
    ingredients: ['niacinamide'],
    emoji: '🔬',
    badge: 'Best Value',
    retailers: ['amazon'],
  },
  {
    id: 'ordinary-retinal',
    step: 'serum',
    name: 'The Ordinary Retinal 0.2% in Squalane',
    brand: 'The Ordinary',
    price: { amount: 20, currency: 'USD' },
    targets: ['wrinkles', 'pigmentation'],
    ingredients: ['retinoid'],
    emoji: '🧪',
    badge: 'Anti-aging',
    retailers: ['amazon'],
  },
  {
    id: 'purito-centella-serum',
    step: 'serum',
    name: 'Purito Centella Unscented Serum',
    brand: 'Purito',
    price: { amount: 16, currency: 'USD' },
    targets: ['redness', 'dryness'],
    ingredients: ['centella'],
    emoji: '🌱',
    badge: 'Soothing',
    retailers: ['amazon', 'oliveyoung'],
  },
  {
    id: 'anua-heartleaf-cream',
    step: 'moisturizer',
    name: 'Anua Heartleaf 77% Soothing Cream',
    brand: 'Anua',
    price: { amount: 24, currency: 'USD' },
    targets: ['redness', 'dryness'],
    ingredients: ['centella'],
    emoji: '🌿',
    badge: 'K-Beauty',
    retailers: ['amazon', 'oliveyoung'],
  },
  {
    id: 'illiyoon-ceramide-cream',
    step: 'moisturizer',
    name: 'Illiyoon Ceramide Ato Concentrate Cream',
    brand: 'Illiyoon',
    price: { amount: 10, currency: 'USD' },
    targets: ['dryness'],
    ingredients: ['ceramide'],
    emoji: '🥛',
    badge: 'Best Value',
    retailers: ['amazon', 'oliveyoung'],
  },
  {
    id: 'boj-relief-sun',
    step: 'spf',
    name: 'Beauty of Joseon Relief Sun: Rice + Probiotics',
    brand: 'Beauty of Joseon',
    price: { amount: 16, currency: 'USD' },
    targets: ['pigmentation', 'wrinkles'],
    ingredients: ['chemical-uv-filter'],
    emoji: '☀️',
    badge: 'K-Beauty',
    retailers: ['amazon', 'oliveyoung'],
  },
  {
    id: 'roundlab-birch-sun',
    step: 'spf',
    name: 'Round Lab Birch Juice Moisturizing Sunscreen',
    brand: 'Round Lab',
    price: { amount: 12, currency: 'USD' },
    targets: ['dryness', 'pigmentation'],
    ingredients: ['chemical-uv-filter'],
    emoji: '🌤️',
    badge: 'Best Value',
    retailers: ['amazon', 'oliveyoung'],
  },
];

/**
 * Supplements are matched on lifestyle answers, never on a photo — the copy is
 * deliberately non-medical ("supports"), and everything here is a general
 * wellness claim. Anything stronger needs regulatory review.
 */
export const SUPPLEMENTS = [
  {
    id: 'omega3',
    name: 'Omega-3 (EPA/DHA)',
    price: { amount: 18, currency: 'USD' },
    targets: ['redness', 'dryness'],
    triggers: ['lowWater'],
    reason: 'Commonly used to support the skin barrier when the diet is low in oily fish.',
    emoji: '🐟',
  },
  {
    id: 'zinc',
    name: 'Zinc Picolinate',
    price: { amount: 9, currency: 'USD' },
    targets: ['acne', 'oiliness'],
    triggers: ['highStress'],
    reason: 'Often paired with acne-prone routines; keep to the label dose.',
    emoji: '⚪',
  },
  {
    id: 'vitamin-c',
    name: 'Vitamin C 500mg',
    price: { amount: 11, currency: 'USD' },
    targets: ['pigmentation', 'wrinkles'],
    triggers: [],
    reason: 'General antioxidant support alongside daily SPF.',
    emoji: '🍊',
  },
  {
    id: 'collagen-peptides',
    name: 'Collagen Peptides',
    price: { amount: 26, currency: 'USD' },
    targets: ['wrinkles', 'dryness'],
    triggers: ['poorSleep'],
    reason: 'Popular for elasticity support; evidence is mixed but tolerance is good.',
    emoji: '🥤',
  },
];

export const DEVICES = [
  {
    id: 'led-mask',
    name: 'LED Therapy Mask',
    price: { amount: 189, currency: 'USD' },
    targets: ['acne', 'wrinkles'],
    reason: 'Red/blue LED sessions a few times a week; check local device certification.',
    requiresCertification: true,
    emoji: '💡',
  },
  {
    id: 'silicone-cleansing-brush',
    name: 'Silicone Cleansing Brush',
    price: { amount: 39, currency: 'USD' },
    targets: ['pores', 'oiliness'],
    reason: 'Gentle daily deep-cleanse without abrasive bristles.',
    requiresCertification: false,
    emoji: '🪥',
  },
  {
    id: 'facial-humidifier',
    name: 'Bedside Humidifier',
    price: { amount: 45, currency: 'USD' },
    targets: ['dryness'],
    reason: 'Raises overnight humidity, which helps dry and tight skin.',
    requiresCertification: false,
    emoji: '💨',
  },
  {
    id: 'microcurrent-device',
    name: 'Microcurrent Lifting Device',
    price: { amount: 219, currency: 'USD' },
    targets: ['wrinkles'],
    reason: 'Short daily sessions for contour; results are temporary.',
    requiresCertification: true,
    emoji: '⚡',
  },
];
