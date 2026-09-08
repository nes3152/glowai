/**
 * Intake answers for the supplement and device suggestions. Photos say nothing
 * about sleep, diet, medication or implants, so everything here is self-reported.
 *
 * LIFESTYLE_FACTORS rank suggestions (see `triggers` in the catalog).
 * HEALTH_FLAGS remove them: a flag is a hard exclusion, never a soft penalty,
 * so a suggestion the user should not take can not resurface with a high score.
 */
export const LIFESTYLE_FACTORS = [
  { id: 'lowWater', label: 'I drink less than 1L of water a day' },
  { id: 'poorSleep', label: 'I usually sleep less than 6 hours' },
  { id: 'highStress', label: 'I have been under a lot of stress' },
  { id: 'lowVeg', label: 'Few vegetables or fruit in my diet' },
  { id: 'outdoors', label: 'I spend hours outdoors most days' },
];

export const LIFESTYLE_FACTOR_IDS = LIFESTYLE_FACTORS.map((factor) => factor.id);

export const HEALTH_FLAGS = [
  {
    id: 'bloodThinners',
    label: 'Blood thinners or daily aspirin',
    note: 'High-dose omega-3 can add to their effect.',
  },
  {
    id: 'fishAllergy',
    label: 'Fish or shellfish allergy',
    note: 'Rules out marine-sourced supplements.',
  },
  {
    id: 'photosensitising',
    label: 'Medication that makes me sun-sensitive',
    note: 'Isotretinoin, doxycycline and similar.',
  },
  {
    id: 'implantedDevice',
    label: 'Pacemaker or other implanted device',
    note: 'Rules out electrical-current devices.',
  },
  {
    id: 'epilepsy',
    label: 'Epilepsy or light-triggered migraine',
    note: 'Rules out flashing light therapy.',
  },
];

export const HEALTH_FLAG_IDS = HEALTH_FLAGS.map((flag) => flag.id);

/** Advisory lines shown with the suggestions; these never filter anything. */
export const HEALTH_ADVICE = {
  pregnancy: 'Clear every supplement and device with your doctor while pregnant or breastfeeding.',
  photosensitising:
    'Sun-sensitising medication means strict daily SPF and shade, whatever the routine says.',
};
