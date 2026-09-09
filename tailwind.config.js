/** @type {import('tailwindcss').Config} */

// The Bench Instrument. Colours are CSS variables declared once per scheme in
// src/global.css; the names below are the only ones components may use. Raw
// Tailwind neutrals (`bg-white`, `text-neutral-500`) are not part of this design
// system — if a value is missing here, add it to global.css rather than reaching
// back into the default palette.
//
// Anything that cannot take a className — Ionicons' `color`, Switch's
// `trackColor`, `android_ripple`, tabBarActiveTintColor — reads the same values
// as raw hex from src/lib/theme.ts. Keep the two in step.

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // The body. `stock` is the ground every screen sits on and is always
        // chassis-2; the other two stops exist for the gradient across it.
        stock: 'var(--stock)',
        chassis: {
          1: 'var(--chassis-1)',
          2: 'var(--chassis-2)',
          3: 'var(--chassis-3)',
        },
        edge: 'var(--edge)',

        // Keycaps stand proud; wells are cut into the body.
        key: {
          DEFAULT: 'var(--key-1)',
          2: 'var(--key-2)',
        },
        well: 'var(--well)',

        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
        },
        hair: 'var(--hair)',

        // Trim. Gold on the dark instrument, Casio blue on the silver one.
        accent: {
          DEFAULT: 'var(--accent)',
          hi: 'var(--accent-hi)',
          lo: 'var(--accent-lo)',
          on: 'var(--on-accent)',
        },

        // The readout. Never used outside the LCD well — see global.css.
        lcd: {
          DEFAULT: 'var(--lcd)',
          2: 'var(--lcd-2)',
          label: 'var(--lcd-label)',
        },
        seg: {
          on: 'var(--seg-on)',
          off: 'var(--seg-off)',
        },

        screw: {
          1: 'var(--screw-1)',
          2: 'var(--screw-2)',
        },

        alert: {
          DEFAULT: 'var(--alert)',
          wash: 'var(--alert-wash)',
        },
        warn: {
          DEFAULT: 'var(--warn)',
          wash: 'var(--warn-wash)',
        },
        today: {
          wash: 'var(--today-wash)',
          edge: 'var(--today-edge)',
        },
      },

      // A moulded enclosure nests smaller components inside larger ones, so the
      // chassis carries the softest corner and everything recessed into it is
      // tighter. Four steps, no more.
      borderRadius: {
        none: '0px',
        well: '6px', // grid columns, the LCD, anything cut into the body
        key: '9px', // keycaps: class blocks, rows, tabs, buttons
        chassis: '14px', // the outer body
      },

      fontFamily: {
        // Chivo, three weights. One face for the whole instrument — a panel is
        // engraved in a single die. Latin only by design: never set these on
        // user-entered content, see the note in src/lib/theme.ts.
        panel: ['Chivo-Regular'],
        'panel-semi': ['Chivo-SemiBold'],
        'panel-bold': ['Chivo-Bold'],
      },

      fontSize: {
        // Engraved-panel scale. Values are sp-equivalent px; React Native scales
        // them with the system font setting automatically.
        // NB: never name a fontSize the same as a colour — `text-stamp` once
        // resolved to the stamp colour rather than a size.
        tag: ['7px', { letterSpacing: '0.1em' }],
        micro: ['8px', { letterSpacing: '0.16em' }],
        code: ['9px', { letterSpacing: '0.04em' }],
        label: ['10px', { letterSpacing: '0.16em' }],
        meta: ['11px', { letterSpacing: '0.06em' }],
        plate: ['11px', { letterSpacing: '0.22em' }], // the nameplate engraving
        body: ['13px', { letterSpacing: '0em' }],
        item: ['15px', { letterSpacing: '-0.01em' }],
        head: ['19px', { letterSpacing: '0.01em' }],
      },
    },
  },
  plugins: [],
};
