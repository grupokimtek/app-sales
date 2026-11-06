module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'media',
  theme: {
    extend: {
      keyframes: {
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0) rotate(-6deg)' },
          '50%': { transform: 'translateY(-14px) rotate(5deg)' }
        },
        twinkle: {
          '0%, 100%': { opacity: '.15', transform: 'scale(.6)' },
          '50%': { opacity: '.75', transform: 'scale(1.15)' }
        },
        sheen: {
          '0%, 55%': { transform: 'translateX(-180%) skewX(-20deg)' },
          '100%': { transform: 'translateX(380%) skewX(-20deg)' }
        },
        'arc-turn': {
          '0%, 100%': { transform: 'rotate(28deg) scale(.95)' },
          '50%': { transform: 'rotate(52deg) scale(1.08)' }
        },
        'slow-spin': { to: { transform: 'rotate(360deg)' } }
      },
      animation: {
        'float-soft': 'float-soft 7s ease-in-out infinite',
        twinkle: 'twinkle 5s ease-in-out infinite',
        sheen: 'sheen 8s ease-in-out infinite',
        'arc-turn': 'arc-turn 16s ease-in-out infinite',
        'slow-spin': 'slow-spin 30s linear infinite'
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      colors: {
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        subtle: 'rgb(var(--color-subtle) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)'
      }
    }
  },
  plugins: []
};
