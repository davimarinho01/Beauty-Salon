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
  Tooltip,
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
}

export const Sidebar = ({ isOpen = true }: SidebarProps) => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('neutral.100', 'gray.700')
  const textColor = useColorModeValue('neutral.600', 'gray.300')
  const activeTextColor = useColorModeValue('brand.600', 'brand.300')
  const activeBg = useColorModeValue('brand.50', 'gray.700')
  const hoverBg = useColorModeValue('neutral.50', 'gray.600')

  // Filtrar navegação baseada no role do usuário
  const navigation = allNavigation.filter(item => 
    item.roles.includes(user?.role || 'recepcao')
  )

  return (
    <Box
      w={isOpen ? '280px' : '80px'}
      h="100vh"
      bg={bgColor}
      borderRight="1px solid"
      borderColor={borderColor}
      position="fixed"
      left={0}
      top={0}
      zIndex={10}
      transition="width 0.3s"
      shadow="sm"
    >
      <VStack h="full" spacing={0} align="stretch">
        {/* Logo */}
        <Box p={6} borderBottom="1px solid" borderColor={borderColor}>
          {isOpen ? (
            <Text fontSize="xl" fontWeight="bold" color="brand.500">
              Beauty Salon
            </Text>
          ) : (
            <Text fontSize="xl" fontWeight="bold" color="brand.500" textAlign="center">
              BS
            </Text>
          )}
        </Box>

        {/* Navigation */}
        <VStack spacing={1} p={4} flex={1} align="stretch">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            
            return (
              <NavLink key={item.name} to={item.href}>
                <Button
                  variant="ghost"
                  w="full"
                  h={12}
                  justifyContent={isOpen ? 'flex-start' : 'center'}
                  px={isOpen ? 4 : 0}
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
                      mr={isOpen ? 0 : undefined}
                    />
                  }
                  borderRadius="md"
                  fontWeight={isActive ? '600' : '400'}
                >
                  {isOpen && item.name}
                </Button>
              </NavLink>
            )
          })}
        </VStack>

        {/* User Info & Settings */}
        <Box p={4} borderTop="1px solid" borderColor={borderColor}>
          {isOpen ? (
            <VStack spacing={4} align="stretch">
              <HStack spacing={3}>
                <Avatar 
                  size="md" 
                  name={user?.nome}
                  bg="brand.200"
                  color="white"
                />
                <VStack spacing={0} align="start" flex={1}>
                  <Text fontSize="sm" fontWeight="600" color={useColorModeValue('neutral.700', 'gray.200')}>
                    {user?.nome}
                  </Text>
                  <Text fontSize="xs" color={useColorModeValue('neutral.500', 'gray.400')}>
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
          ) : (
            <VStack spacing={2}>
              <Tooltip label={`${user?.nome} (${user?.role === 'admin' ? 'Admin' : 'Recepção'})`} placement="right">
                <Avatar 
                  size="sm" 
                  name={user?.nome}
                  bg="brand.200"
                  color="white"
                />
              </Tooltip>
              <Tooltip label="Configurações" placement="right">
                <Button
                  variant="ghost"
                  size="sm"
                  p={2}
                  color="neutral.600"
                  _hover={{ color: 'brand.500' }}
                >
                  <Icon as={Settings} w={4} h={4} />
                </Button>
              </Tooltip>
              <Tooltip label="Sair" placement="right">
                <Button
                  variant="ghost"
                  size="sm"
                  p={2}
                  color="red.600"
                  _hover={{ color: 'red.500' }}
                  onClick={logout}
                >
                  <Icon as={LogOut} w={4} h={4} />
                </Button>
              </Tooltip>
              <ThemeToggle />
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  )
}