import React from 'react'
import {
  IconButton,
  useColorMode,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export const ThemeToggle: React.FC = () => {
  const { colorMode } = useColorMode()
  const { toggleTheme } = useTheme()
  const isDark = colorMode === 'dark'

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  return (
    <Tooltip 
      label={isDark ? 'Modo claro' : 'Modo escuro'} 
      placement="bottom"
      hasArrow
    >
      <IconButton
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        icon={isDark ? <Sun size={18} /> : <Moon size={18} />}
        onClick={toggleTheme}
        variant="ghost"
        size="md"
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        _hover={{
          bg: hoverBg,
          transform: 'scale(1.05)',
        }}
        _active={{
          transform: 'scale(0.95)',
        }}
        transition="all 0.2s"
        borderRadius="lg"
      />
    </Tooltip>
  )
}
