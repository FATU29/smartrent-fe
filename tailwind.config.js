/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],

  theme: {
    screens: {
      sm: '640px', // ≥ 640px → Large mobile phones (landscape) & small tablets
      md: '768px', // ≥ 768px → Tablets (portrait mode) and some small laptops
      lg: '1024px', // ≥ 1024px → Laptops & small desktop monitors
      xl: '1280px', // ≥ 1280px → Large desktop monitors
      '2xl': '1536px', // ≥ 1536px → Extra-large monitors / wide screens
    },
    colors: {
      // Basic colors
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',

      // Theme semantic colors
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--cardForeground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popoverForeground))',
      },
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primaryForeground))',
        // Traditional scale using your primary color
        50: '#E5F2FF',
        100: '#CCE5FF',
        200: '#99CAFF',
        300: '#66B0FF',
        400: '#3396FF',
        500: '#007BFF', // main
        600: '#0063CC',
        700: '#004A99',
        800: '#003166',
        900: '#001933',
        950: '#000C19',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondaryForeground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--mutedForeground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accentForeground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructiveForeground))',
      },
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',

      // Chart colors
      chart: {
        1: 'hsl(var(--chart1))',
        2: 'hsl(var(--chart2))',
        3: 'hsl(var(--chart3))',
        4: 'hsl(var(--chart4))',
        5: 'hsl(var(--chart5))',
      },

      // Sidebar colors
      sidebar: {
        DEFAULT: 'hsl(var(--sidebar))',
        foreground: 'hsl(var(--sidebarForeground))',
        primary: 'hsl(var(--sidebarPrimary))',
        'primary-foreground': 'hsl(var(--sidebarPrimaryForeground))',
        accent: 'hsl(var(--sidebarAccent))',
        'accent-foreground': 'hsl(var(--sidebarAccentForeground))',
        border: 'hsl(var(--sidebarBorder))',
        ring: 'hsl(var(--sidebarRing))',
      },

      // Neutral/Gray colors (keeping original)
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
        950: '#030712',
      },

      // Blue colors (keeping original)
      blue: {
        50: '#E5F2FF',
        100: '#CCE5FF',
        200: '#99CAFF',
        300: '#66B0FF',
        400: '#3396FF',
        500: '#007BFF', // main
        600: '#0063CC',
        700: '#004A99',
        800: '#003166',
        900: '#001933',
        950: '#000C19',
      },

      // Red colors (keeping original)
      red: {
        50: '#FFF1F2',
        100: '#FFE4E6',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444', // main
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D',
        950: '#450A0A',
      },

      // Yellow colors (keeping original)
      yellow: {
        50: '#FEFCE8',
        100: '#FEF9C3',
        200: '#FEF08A',
        300: '#FDE047',
        400: '#FACC15',
        500: '#EAB308', // main
        600: '#CA8A04',
        700: '#A16207',
        800: '#854D0E',
        900: '#713F12',
        950: '#422006',
      },

      // Orange colors (keeping original)
      orange: {
        50: '#FFF7ED',
        100: '#FFEDD5',
        200: '#FED7AA',
        300: '#FDBA74',
        400: '#FB923C',
        500: '#F97316', // main
        600: '#EA580C',
        700: '#C2410C',
        800: '#9A3412',
        900: '#7C2D12',
        950: '#431407',
      },

      // Green colors (keeping original)
      green: {
        50: '#F0FDF4',
        100: '#DCFCE7',
        200: '#BBF7D0',
        300: '#86EFAC',
        400: '#4ADE80',
        500: '#22C55E', // main
        600: '#16A34A',
        700: '#15803D',
        800: '#166534',
        900: '#14532D',
        950: '#052E16',
      },

      // Purple colors (keeping original)
      purple: {
        50: '#FAF5FF',
        100: '#F3E8FF',
        200: '#E9D5FF',
        300: '#D8B4FE',
        400: '#C084FC',
        500: '#A855F7', // main
        600: '#9333EA',
        700: '#7C3AED',
        800: '#6B21A8',
        900: '#581C87',
        950: '#3B0764',
      },

      // Pink colors (keeping original)
      pink: {
        50: '#FDF2F8',
        100: '#FCE7F3',
        200: '#FBCFE8',
        300: '#F9A8D4',
        400: '#F472B6',
        500: '#EC4899', // main
        600: '#DB2777',
        700: '#BE185D',
        800: '#9D174D',
        900: '#831843',
        950: '#500724',
      },

      // Teal colors (keeping original)
      teal: {
        50: '#F0FDFA',
        100: '#CCFBF1',
        200: '#99F6E4',
        300: '#5EEAD4',
        400: '#2DD4BF',
        500: '#14B8A6', // main
        600: '#0D9488',
        700: '#0F766E',
        800: '#115E59',
        900: '#134E4A',
        950: '#042F2E',
      },

      // Indigo colors (keeping original)
      indigo: {
        50: '#EEF2FF',
        100: '#E0E7FF',
        200: '#C7D2FE',
        300: '#A5B4FC',
        400: '#818CF8',
        500: '#6366F1', // main
        600: '#4F46E5',
        700: '#4338CA',
        800: '#3730A3',
        900: '#312E81',
        950: '#1E1B4B',
      },

      // Semantic colors
      success: '#22C55E', // green-500
      warning: '#EAB308', // yellow-500
      error: '#EF4444', // red-500
      info: '#007BFF', // blue-500 (primary)
    },
    extend: {},
  },

  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
  ],
}
