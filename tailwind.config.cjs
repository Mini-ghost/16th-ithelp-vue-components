const defaultTheme = require('tailwindcss/defaultTheme')

const EXTEND_SPACING = {
  ...Object.fromEntries(
    Array.from({ length: 96 }, (_, index) => index + 1).map(space => [
      space,
      `${space}rem`,
    ]),
  ),
  ...Object.fromEntries(
    Array.from({ length: 96 }, (_, index) => index + 1.5).map(space => [
      space,
      `${space * 0.25}rem`,
    ]),
  ),
}

const OVERRIDE_OPACITY = Object.fromEntries(
  Array.from({ length: 21 }, (_, i) => {
    const key = i * 5
    const value = key / 100
    return [key, value]
  }),
)

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: [
      './src/App.vue',
      './src/components/**/*.{js,vue,ts}',
      './src/pages/**/*.vue',
      './index.html',
    ],
  },
  theme: {
    spacing: Object.assign(EXTEND_SPACING, defaultTheme.spacing),
    opacity: OVERRIDE_OPACITY,
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1976D2',
        },

        success: {
          DEFAULT: '#72BF24',
        },

        warning: {
          DEFAULT: '#FFAD0F',
        },

        danger: {
          DEFAULT: '#E52D27',
        },

        info: {
          DEFAULT: '#909399',
        },
      },

      fontFamily: {
        sans: ['Noto Sans TC', ...defaultTheme.fontFamily.sans],
      },

      zIndex: {
        1: 1,
      },
    },
  },
}
