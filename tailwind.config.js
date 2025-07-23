/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // NelsonGPT Dark Medical Theme
        background: '#1e1e1e',
        'chat-container': '#121212',
        'user-message': '#2a2a2a',
        'assistant-message': '#1a1a1a',
        'text-primary': '#f2f2f2',
        'text-secondary': '#b3b3b3',
        'text-muted': '#666666',
        'border-primary': '#333333',
        'border-secondary': '#2a2a2a',
        'accent-primary': '#ffffff',
        'accent-secondary': '#e5e5e5',
        'medical-primary': '#4a90e2',
        'medical-secondary': '#357abd',
        'medical-success': '#28a745',
        'medical-warning': '#ffc107',
        'medical-error': '#dc3545',
        'medical-info': '#17a2b8',
        'code-bg': '#0d1117',
        'code-border': '#30363d',
        'sidebar-bg': '#1a1a1a',
        'input-bg': '#2a2a2a',
        'input-border': '#404040',
        'button-primary': '#ffffff',
        'button-secondary': '#666666',
        'citation-bg': '#2d2d2d',
        'citation-border': '#4a4a4a'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
        medical: ['Inter', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'medical-title': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'medical-subtitle': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        'medical-body': ['1rem', { lineHeight: '1.5rem' }],
        'medical-caption': ['0.875rem', { lineHeight: '1.25rem' }]
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        'chat-input': '4rem',
        'sidebar-width': '16rem',
        'mobile-padding': '1rem',
        'desktop-padding': '2rem'
      },
      borderRadius: {
        'message': '1rem',
        'input': '1.5rem',
        'button': '0.75rem',
        'card': '0.5rem'
      },
      boxShadow: {
        'message': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'input': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'sidebar': '2px 0 8px rgba(0, 0, 0, 0.3)',
        'medical-glow': '0 0 20px rgba(74, 144, 226, 0.3)',
        'citation': '0 2px 4px rgba(0, 0, 0, 0.2)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'typing 1.5s steps(3, end) infinite',
        'message-appear': 'messageAppear 0.4s ease-out',
        'sidebar-slide': 'sidebarSlide 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        typing: {
          '0%, 60%': { content: '.' },
          '20%': { content: '..' },
          '40%': { content: '...' }
        },
        messageAppear: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(10px) scale(0.95)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)' 
          }
        },
        sidebarSlide: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        }
      },
      screens: {
        'xs': '475px',
        'mobile': '640px',
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1280px',
        'wide': '1536px'
      },
      zIndex: {
        'sidebar': '40',
        'modal': '50',
        'toast': '60',
        'splash': '70'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#2a2a2a'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#666666',
            'border-radius': '3px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#888888'
          }
        },
        '.medical-gradient': {
          background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)'
        },
        '.glass-effect': {
          'backdrop-filter': 'blur(10px)',
          'background-color': 'rgba(26, 26, 26, 0.8)'
        },
        '.text-shadow-sm': {
          'text-shadow': '0 1px 2px rgba(0, 0, 0, 0.5)'
        },
        '.safe-area-inset': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)'
        }
      }
      addUtilities(newUtilities)
    }
  ],
}

