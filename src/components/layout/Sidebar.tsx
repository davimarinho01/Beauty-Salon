import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Avatar,
  Badge,
  useColorModeValue,
  Divider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react'
import { 
  Home,
  DollarSign,
  Scissors,
  Calendar,
  FileText,
  CreditCard,
  Users,
  Settings,
  LogOut,
  UserCheck,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'

// Navegação completa (para admin)
const allNavigation = [
  { name: 'Principal', href: '/', icon: Home, roles: ['admin'] },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign, roles: ['admin', 'recepcao'] },
  { name: 'Agendamento', href: '/agendamento', icon: Calendar, roles: ['admin', 'recepcao'] },
  { name: 'Serviços', href: '/servicos', icon: Scissors, roles: ['admin'] },
  { name: 'Extrato', href: '/extrato', icon: FileText, roles: ['admin'] },
  { name: 'Pagamentos', href: '/pagamentos', icon: CreditCard, roles: ['admin'] },
  { name: 'Funcionários', href: '/funcionarios', icon: Users, roles: ['admin'] },
  { name: 'Usuários', href: '/usuarios', icon: UserCheck, roles: ['admin'] },
  { name: 'Configurações', href: '/configuracoes', icon: Settings, roles: ['admin'] },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
}

export const Sidebar = ({ isOpen = true, onClose, isMobile = false }: SidebarProps) => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('neutral.100', 'gray.700')
  const textColor = useColorModeValue('neutral.600', 'gray.300')
  const activeTextColor = useColorModeValue('brand.600', 'brand.300')
  const activeBg = useColorModeValue('brand.50', 'gray.700')
  const hoverBg = useColorModeValue('neutral.50', 'gray.600')
  const userNameColor = useColorModeValue('neutral.700', 'gray.200')
  const userRoleColor = useColorModeValue('neutral.500', 'gray.400')

  // Filtrar navegação baseada no role do usuário
  const navigation = allNavigation.filter(item => 
    item.roles.includes(user?.role || 'recepcao')
  )

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose()
    }
  }

  const SidebarContent = () => (
    <VStack h="full" spacing={0} align="stretch">
      {/* Logo */}
      <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
        <Text fontSize="xl" fontWeight="bold" color="brand.500">
          Beauty Salon
        </Text>
      </Box>

      {/* Navigation */}
      <VStack spacing={1} p={4} flex={1} align="stretch">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          
          return (
            <NavLink key={item.name} to={item.href} onClick={handleNavClick}>
              <Button
                variant="ghost"
                w="full"
                h={12}
                justifyContent="flex-start"
                px={4}
                bg={isActive ? activeBg : 'transparent'}
                color={isActive ? activeTextColor : textColor}
                _hover={{ 
                  bg: isActive ? activeBg : hoverBg,
                  color: isActive ? activeTextColor : 'brand.500'
                }}
                leftIcon={
                  <Icon 
                    as={item.icon} 
                    w={5} 
                    h={5}
                  />
                }
                borderRadius="md"
                fontWeight={isActive ? '600' : '400'}
              >
                {item.name}
              </Button>
            </NavLink>
          )
        })}
      </VStack>

      {/* User Info & Settings */}
      <Box p={4} borderTop="1px solid" borderColor={borderColor}>
        <VStack spacing={4} align="stretch">
          <HStack spacing={3}>
            <Avatar 
              size="md" 
              name={user?.nome}
              bg="brand.200"
              color="white"
            />
            <VStack spacing={0} align="start" flex={1}>
              <Text fontSize="sm" fontWeight="600" color={userNameColor}>
                {user?.nome}
              </Text>
              <Text fontSize="xs" color={userRoleColor}>
                {user?.role === 'admin' ? 'Administrador' : 'Recepção'}
              </Text>
            </VStack>
            <Badge colorScheme="green" variant="subtle" fontSize="xs">
              Online
            </Badge>
          </HStack>
          
          <Divider />
          
          <VStack spacing={2}>
            <Button
              variant="ghost"
              size="sm"
              w="full"
              leftIcon={<Icon as={Settings} w={4} h={4} />}
              color={useColorModeValue('neutral.600', 'gray.300')}
              _hover={{ color: 'brand.500' }}
            >
              Configurações
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              w="full"
              leftIcon={<Icon as={LogOut} w={4} h={4} />}
              color={useColorModeValue('red.600', 'red.300')}
              _hover={{ color: 'red.500', bg: useColorModeValue('red.50', 'red.900') }}
              onClick={logout}
            >
              Sair
            </Button>
            
            <ThemeToggle />
          </VStack>
        </VStack>
      </Box>
    </VStack>
  )

  if (isMobile) {
    return (
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose || (() => {})}
        size="sm"
      >
        <DrawerOverlay />
        <DrawerContent bg={bgColor}>
          <DrawerCloseButton />
          <SidebarContent />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Box
      w="280px"
      h="100vh"
      bg={bgColor}
      borderRight="1px solid"
      borderColor={borderColor}
      position="fixed"
      left={0}
      top={0}
      zIndex={10}
      shadow="sm"
      display={{ base: 'none', md: 'block' }}
    >
      <SidebarContent />
    </Box>
  )
}
