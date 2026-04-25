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

// Dark theme — Better Stack-inspired (betterstack.com): deep navy with violet accent.
//   bg #0B0C14, card #13141C, secondary #1C1E2A, border #1F2230,
//   foreground #F5F6FA, muted #9099B0, primary #7B5CFF (violet).
// Keep these in sync with `.dark` block in src/styles/globals.css.
export const dark = {
  background: 'oklch(0.11 0.018 268)',
  foreground: 'oklch(0.97 0.005 270)',
  card: 'oklch(0.16 0.018 268)',
  cardForeground: 'oklch(0.97 0.005 270)',
  popover: 'oklch(0.16 0.018 268)',
  popoverForeground: 'oklch(0.97 0.005 270)',
  primary: 'oklch(0.62 0.235 295)',
  primaryForeground: 'oklch(0.97 0.005 270)',
  secondary: 'oklch(0.22 0.02 270)',
  secondaryForeground: 'oklch(0.97 0.005 270)',
  muted: 'oklch(0.22 0.02 270)',
  mutedForeground: 'oklch(0.66 0.025 265)',
  accent: 'oklch(0.24 0.02 270)',
  accentForeground: 'oklch(0.97 0.005 270)',
  destructive: 'oklch(0.62 0.22 25)',
  destructiveForeground: 'oklch(0.97 0.005 270)',
  border: 'oklch(0.23 0.02 270)',
  input: 'oklch(0.24 0.02 270)',
  ring: 'oklch(0.62 0.235 295)',
  chart1: 'oklch(0.62 0.235 295)',
  chart2: 'oklch(0.7 0.18 200)',
  chart3: 'oklch(0.72 0.18 145)',
  chart4: 'oklch(0.7 0.18 30)',
  chart5: 'oklch(0.78 0.16 80)',
  sidebar: 'oklch(0.14 0.018 268)',
  sidebarForeground: 'oklch(0.97 0.005 270)',
  sidebarPrimary: 'oklch(0.62 0.235 295)',
  sidebarPrimaryForeground: 'oklch(0.97 0.005 270)',
  sidebarAccent: 'oklch(0.22 0.02 270)',
  sidebarAccentForeground: 'oklch(0.97 0.005 270)',
  sidebarBorder: 'oklch(0.23 0.02 270)',
  sidebarRing: 'oklch(0.62 0.235 295)',
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
