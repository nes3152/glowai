export const colors = {
  accent: '#d4718c',
  accentDeep: '#b85273',
  accentSoft: '#fdeef2',
  accentFaint: '#f8e1e8',
  onAccent: '#ffffff',

  bg: '#fffaf7',
  text: '#3b2b30',
  textStrong: '#4c383e',
  textBody: '#6d565c',
  textMuted: '#9c8a8f',

  surface: '#ffffff',
  surfaceStrong: '#f7ece7',
  surfaceFaint: '#fbf5f2',
  border: '#f0e3dd',
  borderStrong: '#e3d2cc',

  track: '#efe3df',
  disabled: '#e8dcd7',
  disabledText: '#a3918c',
  success: '#4f9d7c',
  warning: '#a86a1f',
  warningSoft: '#fdf2e2',
  warningBorder: '#f2ddbd',

  dark: '#241b1e',
  onDark: '#ffffff',
};

export const gradient = ['#fffdfb', '#fdf3ee', '#fbe8ea'];

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 10, md: 16, lg: 20, xl: 24, pill: 30 };

/** Keeps the phone-first layout readable on wide desktop browsers. */
export const maxContentWidth = 460;

export const centeredColumn = {
  width: '100%',
  maxWidth: maxContentWidth,
  alignSelf: 'center',
};

/** Soft warm elevation used on cards and primary buttons. */
export const shadow = {
  shadowColor: '#b08a80',
  shadowOpacity: 0.16,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export const typography = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.4 },
  section: { fontSize: 19, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '500' },
  caption: { fontSize: 13, fontWeight: '500' },
};
