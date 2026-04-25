// theme.ts
export const light = {
  background: 'oklch(1 0 0)',
  foreground: 'oklch(0.145 0 0)',
  card: 'oklch(1 0 0)',
  cardForeground: 'oklch(0.145 0 0)',
  popover: 'oklch(1 0 0)',
  popoverForeground: 'oklch(0.145 0 0)',
  primary: 'oklch(0.55 0.25 260)',
  primaryForeground: 'oklch(1 0 0)',
  secondary: 'oklch(0.97 0 0)',
  secondaryForeground: 'oklch(0.205 0 0)',
  muted: 'oklch(0.97 0 0)',
  mutedForeground: 'oklch(0.556 0 0)',
  accent: 'oklch(0.97 0 0)',
  accentForeground: 'oklch(0.205 0 0)',
  destructive: 'oklch(0.577 0.245 27.325)',
  destructiveForeground: 'oklch(1 0 0)',
  border: 'oklch(0.922 0 0)',
  input: 'oklch(0.922 0 0)',
  ring: 'oklch(0.55 0.25 260)',
  chart1: 'oklch(0.646 0.222 41.116)',
  chart2: 'oklch(0.6 0.118 184.704)',
  chart3: 'oklch(0.398 0.07 227.392)',
  chart4: 'oklch(0.828 0.189 84.429)',
  chart5: 'oklch(0.769 0.188 70.08)',
  sidebar: 'oklch(0.985 0 0)',
  sidebarForeground: 'oklch(0.145 0 0)',
  sidebarPrimary: 'oklch(0.55 0.25 260)',
  sidebarPrimaryForeground: 'oklch(1 0 0)',
  sidebarAccent: 'oklch(0.97 0 0)',
  sidebarAccentForeground: 'oklch(0.205 0 0)',
  sidebarBorder: 'oklch(0.922 0 0)',
  sidebarRing: 'oklch(0.55 0.25 260)',
}

// Dark theme — softer than pure black: neutral warm dark gray with layered surfaces.
// Values intentionally lighter than pure black so surfaces are readable
// and there is contrast between background / card / popover layers.
// Keep these in sync with `.dark` block in src/styles/globals.css.
export const dark = {
  background: 'oklch(0.36 0.004 250)',
  foreground: 'oklch(0.9 0.008 95)',
  card: 'oklch(0.42 0.005 250)',
  cardForeground: 'oklch(0.9 0.008 95)',
  popover: 'oklch(0.42 0.005 250)',
  popoverForeground: 'oklch(0.9 0.008 95)',
  primary: 'oklch(0.74 0.17 300)',
  primaryForeground: 'oklch(0.985 0 0)',
  secondary: 'oklch(0.46 0.006 250)',
  secondaryForeground: 'oklch(0.9 0.008 95)',
  muted: 'oklch(0.44 0.005 250)',
  mutedForeground: 'oklch(0.74 0.008 250)',
  accent: 'oklch(0.49 0.006 250)',
  accentForeground: 'oklch(0.9 0.008 95)',
  destructive: 'oklch(0.65 0.2 25)',
  destructiveForeground: 'oklch(0.985 0 0)',
  border: 'oklch(1 0 0 / 12%)',
  input: 'oklch(1 0 0 / 15%)',
  ring: 'oklch(0.74 0.17 300)',
  chart1: 'oklch(0.74 0.17 300)',
  chart2: 'oklch(0.87 0.22 148)',
  chart3: 'oklch(0.87 0.1 210)',
  chart4: 'oklch(0.75 0.2 355)',
  chart5: 'oklch(0.81 0.14 60)',
  sidebar: 'oklch(0.4 0.005 250)',
  sidebarForeground: 'oklch(0.9 0.008 95)',
  sidebarPrimary: 'oklch(0.74 0.17 300)',
  sidebarPrimaryForeground: 'oklch(0.985 0 0)',
  sidebarAccent: 'oklch(0.46 0.006 250)',
  sidebarAccentForeground: 'oklch(0.9 0.008 95)',
  sidebarBorder: 'oklch(1 0 0 / 12%)',
  sidebarRing: 'oklch(0.74 0.17 300)',
}

export const theme = {
  light,
  dark,
}

export type ThemeMode = 'light' | 'dark'

export default function setGlobalColorTheme(themeMode: ThemeMode) {
  const selectedTheme = theme[themeMode] as { [key: string]: string }

  for (const key in selectedTheme) {
    document.documentElement.style.setProperty(`--${key}`, selectedTheme[key])
  }
}
