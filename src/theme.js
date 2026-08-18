/** Switzer (Fontshare, free licence) — loaded in App.js, files in assets/fonts. */
export const fonts = {
  light: 'Switzer-Light',
  regular: 'Switzer-Regular',
  medium: 'Switzer-Medium',
  semibold: 'Switzer-Semibold',
};

/** Monochrome palette: ink on off-white, hairline borders, no colour accents. */
export const colors = {
  accent: '#0f1012',
  accentDeep: '#000000',
  accentSoft: '#f2f2f4',
  accentFaint: '#e6e6e8',
  onAccent: '#ffffff',

  bg: '#f8f8f8',
  text: '#0f1012',
  textStrong: '#1d1e20',
  textBody: '#4b4c4f',
  textMuted: '#8e8f94',

  surface: '#ffffff',
  surfaceStrong: '#efefef',
  surfaceFaint: '#f8f8f8',
  border: '#e6e6e8',
  borderStrong: '#d5d5d9',

  track: '#e6e6e8',
  disabled: '#e6e6e8',
  disabledText: '#a9aaae',
  success: '#00b982',
  warning: '#1d1e20',
  warningSoft: '#f2f2f4',
  warningBorder: '#e6e6e8',

  dark: '#0f1012',
  onDark: '#ffffff',
};

export const gradient = ['#ffffff', '#f8f8f8', '#f2f2f4'];

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 8, md: 12, lg: 14, xl: 16, pill: 999 };

/** Keeps the phone-first layout readable on wide desktop browsers. */
export const maxContentWidth = 460;

export const centeredColumn = {
  width: '100%',
  maxWidth: maxContentWidth,
  alignSelf: 'center',
};

/** Flat design: cards are separated by hairline borders, not elevation. */
export const shadow = {
  shadowColor: 'transparent',
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
  elevation: 0,
};

export const typography = {
  display: { fontFamily: fonts.medium, fontSize: 36, letterSpacing: -1.1 },
  title: { fontFamily: fonts.medium, fontSize: 28, letterSpacing: -0.8 },
  section: { fontFamily: fonts.medium, fontSize: 18, letterSpacing: -0.4 },
  body: { fontFamily: fonts.regular, fontSize: 15, letterSpacing: -0.1 },
  caption: { fontFamily: fonts.regular, fontSize: 13 },
  /** Tiny tracked-out caps used above sections, the way augen.pro labels blocks. */
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
};
