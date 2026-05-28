import {
  defineConfig,
  presetUno,
  presetTypography,
  presetWebFonts,
} from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
  presets: [
    presetUno(),
    presetTypography({
      cssExtend: {
        'h1,h2,h3,h4,h5,h6': {
          'font-family': 'var(--font-serif)',
          color: 'var(--color-text)',
        },
        p: {
          color: 'var(--color-text)',
          'line-height': '1.8',
        },
        a: {
          color: 'var(--color-primary)',
          'text-decoration': 'underline',
          'text-underline-offset': '3px',
        },
        'a:hover': {
          color: 'var(--color-primary-light)',
        },
        code: {
          'font-family': 'var(--font-mono)',
          'font-size': '0.875em',
          'background-color': 'var(--color-code-bg)',
          padding: '0.15em 0.4em',
          'border-radius': '4px',
          color: 'var(--color-text)',
        },
        pre: {
          'background-color': 'var(--color-pre-bg) !important',
          border: '1px solid var(--color-border)',
          'border-radius': '8px',
        },
        'pre code': {
          'background-color': 'transparent',
          padding: '0',
        },
        blockquote: {
          'border-left': '3px solid var(--color-primary)',
          'padding-left': '1rem',
          color: 'var(--color-text-muted)',
          'font-style': 'italic',
        },
        hr: {
          'border-color': 'var(--color-border)',
        },
        table: {
          'border-collapse': 'collapse',
          width: '100%',
        },
        'th,td': {
          border: '1px solid var(--color-border)',
          padding: '0.5rem 0.75rem',
        },
        th: {
          'background-color': 'var(--color-bg-secondary)',
          'font-weight': '600',
        },
        u: {
          'text-decoration': 'underline',
          'text-underline-offset': '3px',
          'text-decoration-color': 'var(--color-primary)',
        },
      },
    }),
    presetWebFonts({
      provider: 'google',
      fonts: {
        serif: [{ name: 'Lora', weights: ['400', '500', '600', '700'], italic: true }],
        display: [{ name: 'Playfair Display', weights: ['400', '600', '700'] }],
        mono: [{ name: 'JetBrains Mono', weights: ['400', '500'] }],
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      coffee: {
        50: '#faf6f1',
        100: '#f5ece0',
        200: '#e8d5bf',
        300: '#d4b591',
        400: '#c4956a',
        500: '#b07848',
        600: '#9a6439',
        700: '#7b4e2e',
        800: '#6f4e37',
        900: '#5a3f2e',
        950: '#2e1f17',
      },
    },
    fontFamily: {
      serif: ['Lora', 'Noto Serif SC', 'Georgia', 'serif'],
      display: ['Playfair Display', 'Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },
  },
  shortcuts: {
    'btn-icon':
      'inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200 hover:bg-[var(--color-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
    'nav-link':
      'text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors duration-200',
  },
})
