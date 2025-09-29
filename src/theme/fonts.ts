import {
  Be_Vietnam_Pro,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from 'next/font/google'

// Be Vietnam Pro: excellent Vietnamese + English support
export const beVietnam = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

// JetBrains Mono for code/mono
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
})

// Optional heading font (geometric, good bilingual rendering)
export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  weight: ['500', '600', '700'],
})

export const fontVariables = [
  beVietnam.variable,
  jetbrainsMono.variable,
  jakarta.variable,
].join(' ')
