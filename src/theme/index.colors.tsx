// theme.ts
// Theme colors are defined in src/styles/globals.css via the .dark class
// and CSS custom properties. Do NOT set them inline on documentElement —
// inline styles have higher specificity and would override the stylesheet.
export type ThemeMode = 'light' | 'dark'

// Stale CSS variables that prior versions of this file wrote to <html>.
// We strip them on every theme change so the stylesheet wins.
const STALE_VARS = [
  '--background',
  '--foreground',
  '--card',
  '--cardForeground',
  '--card-foreground',
  '--popover',
  '--popoverForeground',
  '--popover-foreground',
  '--primary',
  '--primaryForeground',
  '--primary-foreground',
  '--secondary',
  '--secondaryForeground',
  '--secondary-foreground',
  '--muted',
  '--mutedForeground',
  '--muted-foreground',
  '--accent',
  '--accentForeground',
  '--accent-foreground',
  '--destructive',
  '--destructiveForeground',
  '--destructive-foreground',
  '--border',
  '--input',
  '--ring',
  '--chart1',
  '--chart-1',
  '--chart2',
  '--chart-2',
  '--chart3',
  '--chart-3',
  '--chart4',
  '--chart-4',
  '--chart5',
  '--chart-5',
  '--sidebar',
  '--sidebarForeground',
  '--sidebar-foreground',
  '--sidebarPrimary',
  '--sidebar-primary',
  '--sidebarPrimaryForeground',
  '--sidebar-primary-foreground',
  '--sidebarAccent',
  '--sidebar-accent',
  '--sidebarAccentForeground',
  '--sidebar-accent-foreground',
  '--sidebarBorder',
  '--sidebar-border',
  '--sidebarRing',
  '--sidebar-ring',
]

export default function setGlobalColorTheme(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  for (const v of STALE_VARS) {
    root.style.removeProperty(v)
  }
}
