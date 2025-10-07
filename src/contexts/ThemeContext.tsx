import React, { createContext, useContext, useEffect } from 'react'
import { useColorMode } from '@chakra-ui/react'

interface ThemeContextData {
  isDark: boolean
  toggleTheme: () => void
  theme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { colorMode, setColorMode } = useColorMode()

  // Sincronizar estado inicial
  useEffect(() => {
    const savedTheme = localStorage.getItem('beauty-salon-theme') as 'light' | 'dark' | null
    
    if (savedTheme && colorMode !== savedTheme) {
      setColorMode(savedTheme)
    } else if (!savedTheme) {
      // Se não há tema salvo, salvar o colorMode atual do Chakra UI
      localStorage.setItem('beauty-salon-theme', colorMode)
    }
  }, [colorMode, setColorMode])

  const toggleTheme = () => {
    const newTheme = colorMode === 'light' ? 'dark' : 'light'
    setColorMode(newTheme)
    localStorage.setItem('beauty-salon-theme', newTheme)
  }

  const isDark = colorMode === 'dark'

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        theme: colorMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
