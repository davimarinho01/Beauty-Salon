import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
  Icon,
  InputGroup,
  Input,
  InputLeftElement,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react'
import { Search, Bell, Settings, LogOut, Menu as MenuIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface HeaderProps {
  sidebarWidth: string
  onMenuClick?: () => void
  isMobile?: boolean
}

export const Header = ({ sidebarWidth, onMenuClick, isMobile = false }: HeaderProps) => {
  const { user, logout } = useAuth()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('neutral.100', 'gray.700')
  const inputBg = useColorModeValue('neutral.50', 'gray.700')
  const inputBorderColor = useColorModeValue('neutral.200', 'gray.600')
  const textColor = useColorModeValue('neutral.700', 'gray.200')
  const placeholderColor = useColorModeValue('neutral.400', 'gray.400')
  const roleTextColor = useColorModeValue('neutral.500', 'gray.400')

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={{ base: 0, md: sidebarWidth }}
      right={0}
      h="70px"
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      zIndex={999}
      boxShadow="0 2px 4px rgba(0, 0, 0, 0.02)"
    >
      <Flex h="full" align="center" justify="space-between" px={{ base: 4, md: 6 }}>
        {/* Menu mobile e área de busca */}
        <HStack spacing={4} flex={1}>
          {/* Botão de menu mobile */}
          {isMobile && (
            <IconButton
              aria-label="Abrir menu"
              icon={<Icon as={MenuIcon} />}
              variant="ghost"
              size="md"
              onClick={onMenuClick}
              color={useColorModeValue('neutral.600', 'gray.300')}
              _hover={{ 
                color: 'brand.500', 
                bg: useColorModeValue('brand.50', 'gray.700') 
              }}
            />
          )}
          
          {/* Área de busca */}
          <Box flex={1} maxW={{ base: 'none', md: '400px' }}>
            <InputGroup size="md">
              <InputLeftElement>
                <Icon as={Search} w={4} h={4} color="neutral.400" />
              </InputLeftElement>
              <Input
                placeholder={isMobile ? "Buscar..." : "Buscar clientes, serviços, agendamentos..."}
                borderRadius="lg"
                bg={inputBg}
                border="1px solid"
                borderColor={inputBorderColor}
                color={textColor}
                _placeholder={{ color: placeholderColor }}
                _focus={{
                  bg: useColorModeValue('white', 'gray.600'),
                  borderColor: 'brand.200',
                  boxShadow: '0 0 0 1px rgba(226, 180, 203, 0.6)',
                }}
              />
            </InputGroup>
          </Box>
        </HStack>

        {/* Área de ações */}
        <HStack spacing={{ base: 2, md: 4 }}>
          {/* Notificações */}
          <Button
            variant="ghost"
            size="sm"
            position="relative"
            color={useColorModeValue('neutral.600', 'gray.300')}
            _hover={{ 
              color: 'brand.500', 
              bg: useColorModeValue('brand.50', 'gray.700') 
            }}
          >
            <Icon as={Bell} w={5} h={5} />
            <Badge
              position="absolute"
              top="0"
              right="0"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              w="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              3
            </Badge>
          </Button>

          {/* Menu do usuário */}
          <Menu>
            <MenuButton>
              <HStack spacing={3} cursor="pointer">
                <Avatar 
                  size="sm" 
                  name="Admin User"
                  bg="brand.200"
                  color="white"
                />
                <Box textAlign="left" display={{ base: 'none', md: 'block' }}>
                  <Text fontSize="sm" fontWeight="600" color={textColor}>
                    {user?.nome || 'Admin User'}
                  </Text>
                  <Text fontSize="xs" color={roleTextColor}>
                    {user?.role === 'admin' ? 'Administrador' : 'Recepção'}
                  </Text>
                </Box>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<Icon as={Settings} w={4} h={4} />}>
                Configurações
              </MenuItem>
              <MenuItem 
                icon={<Icon as={LogOut} w={4} h={4} />} 
                color="red.500"
                onClick={handleLogout}
              >
                Sair
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  )
}
