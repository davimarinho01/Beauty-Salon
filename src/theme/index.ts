import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// Configuração do tema
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
}

//  rosa com alias conveniente
const colors = {
  rosa: {
    50: '#FCF2F7',   // Rosa muito claro
    100: '#F7E1ED',  // Rosa claro
    200: '#E8B4CB',  // Rosa gold - cor principal
    300: '#DB91B8',  // Rosa médio
    400: '#CF6FA5',  // Rosa vibrante
    500: '#C24D92',  // Rosa escuro
    600: '#A53D7A',  // Rosa profundo
    700: '#882D62',  // Rosa muito escuro
    800: '#6B1E4A',  // Rosa quase preto
    900: '#4E0E32',  // Rosa escuro
  },
  brand: {
    50: '#FCF2F7',   // Rosa muito claro
    100: '#F7E1ED',  // Rosa claro
    200: '#E8B4CB',  // Rosa gold - cor principal
    300: '#DB91B8',  // Rosa médio
    400: '#CF6FA5',  // Rosa vibrante
    500: '#C24D92',  // Rosa escuro
    600: '#A53D7A',  // Rosa profundo
    700: '#882D62',  // Rosa muito escuro
    800: '#6B1E4A',  // Rosa quase preto
    900: '#4E0E32',  // Rosa escuro
  },
  gold: {
    50: '#FDF8E8',   // Dourado muito claro
    100: '#F9ECBE',  // Dourado claro
    200: '#F4D775',  // Dourado médio
    300: '#EFC32C',  // Dourado vibrante
    400: '#D4AF37',  // Dourado principal
    500: '#B8941F',  // Dourado escuro
    600: '#9C7A07',  // Dourado profundo
    700: '#806000',  // Dourado muito escuro
    800: '#644600',  // Dourado quase preto
    900: '#482C00',  // Dourado escuro
  },
  accent: {
    coral: '#FF6B9D',    // Rosa coral
    mint: '#4FD1C7',     // Verde menta
    lavender: '#B794F6', // Lavanda
    peach: '#FBB6CE',    // Pêssego
  },
  neutral: {
    50: '#F8F9FA',   // Branco pérola
    100: '#F1F3F4',  // Cinza muito claro
    200: '#E8EAED',  // Cinza claro
    300: '#DADCE0',  // Cinza médio claro
    400: '#BDC1C6',  // Cinza médio
    500: '#9AA0A6',  // Cinza
    600: '#80868B',  // Cinza escuro
    700: '#5F6368',  // Cinza muito escuro
    800: '#3C4043',  // Cinza quase preto
    900: '#202124',  // Preto suave
  }
}

// Tipografia elegante
const fonts = {
  heading: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"Fira Code", "Consolas", monospace'
}

// Estilos globais
const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'neutral.50',
      color: props.colorMode === 'dark' ? 'gray.50' : 'neutral.800',
      fontFamily: 'body',
      lineHeight: 'base',
    },
    '*::placeholder': {
      color: props.colorMode === 'dark' ? 'gray.400' : 'neutral.400',
    },
    '*, *::before, &::after': {
      borderColor: props.colorMode === 'dark' ? 'gray.600' : 'neutral.200',
    },
  }),
}

// Componentes customizados
const components = {
  Button: {
    baseStyle: {
      fontWeight: '500',
      borderRadius: 'lg',
      _focus: {
        boxShadow: '0 0 0 3px rgba(226, 180, 203, 0.6)',
      },
    },
    variants: {
      solid: () => ({
        bg: 'brand.200',
        color: 'white',
        _hover: {
          bg: 'brand.300',
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
        _active: {
          bg: 'brand.400',
          transform: 'translateY(0)',
        },
      }),
      ghost: (props: any) => ({
        color: props.colorMode === 'dark' ? 'brand.300' : 'brand.500',
        _hover: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'brand.50',
          transform: 'translateY(-1px)',
        },
      }),
      gold: {
        bg: 'gold.400',
        color: 'white',
        _hover: {
          bg: 'gold.500',
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
        },
      },
    },
    sizes: {
      sm: {
        h: '8',
        px: '4',
        fontSize: 'sm',
      },
      md: {
        h: '10',
        px: '6',
        fontSize: 'md',
      },
      lg: {
        h: '12',
        px: '8',
        fontSize: 'lg',
      },
    },
  },
  Card: {
    baseStyle: (props: any) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        borderRadius: 'xl',
        boxShadow: props.colorMode === 'dark' 
          ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
          : '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid',
        borderColor: props.colorMode === 'dark' ? 'gray.600' : 'neutral.100',
        _hover: {
          boxShadow: props.colorMode === 'dark'
            ? '0 8px 25px rgba(0, 0, 0, 0.4)'
            : '0 8px 25px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease',
      },
    }),
  },
  Input: {
    variants: {
      filled: (props: any) => ({
        field: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'neutral.50',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'neutral.200',
          color: props.colorMode === 'dark' ? 'gray.100' : 'neutral.800',
          _hover: {
            bg: props.colorMode === 'dark' ? 'gray.600' : 'white',
            borderColor: 'brand.200',
          },
          _focus: {
            bg: props.colorMode === 'dark' ? 'gray.600' : 'white',
            borderColor: 'brand.300',
            boxShadow: '0 0 0 1px rgba(226, 180, 203, 0.6)',
          },
        },
      }),
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Modal: {
    baseStyle: (props: any) => ({
      dialog: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        borderRadius: 'xl',
        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
}

// Configurações de espaçamento e bordas
const space = {
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
}

const radii = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
}

const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
  space,
  radii,
})

export default theme
