// all visual values come from here — no raw hex / fontSize / spacing in components.
export const tokens = {
  colors: {
    text: '#111111',
    textMuted: '#666666',
    border: '#cccccc',
    borderStrong: '#000000',
    divider: '#dddddd',
    surface: '#ffffff',
  },
  spacing: { xs: 8, sm: 16, md: 24, lg: 32, xl: 48 },
  radius: { sm: 4, md: 8 },
  fontSize: { sm: 12, md: 16, lg: 20, title: 24, price: 28 },
  borderWidth: { thin: 1, thick: 2 },
} as const;
