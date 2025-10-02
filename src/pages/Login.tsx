import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Icon,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react'
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import type { LoginCredentials } from '../types'


interface LoginErrors {
  email?: string
  password?: string
  general?: string
}

export default function Login() {
  const { login, isAuthenticated, isLoading, user } = useAuth()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cores do tema
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, purple.900, blue.900)'
  )
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const headingColor = useColorModeValue('gray.800', 'white')

  // Redirecionamento baseado na role do usuário
  useEffect(() => {
    if (isAuthenticated && user) {
      // Admin vai para a página principal (Dashboard)
      // Recepção vai para a página Financeiro
      const redirectPath = user.role === 'admin' ? '/' : '/financeiro'
      window.location.href = redirectPath
    }
  }, [isAuthenticated, user])

  if (isAuthenticated && user) {
    const redirectPath = user.role === 'admin' ? '/' : '/financeiro'
    return <Navigate to={redirectPath} replace />
  }

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {}

    if (!credentials.email) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = 'E-mail inválido'
    }

    if (!credentials.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})
    
    try {
      await login(credentials.email, credentials.password)
    } catch (error) {
      console.error('Erro no login:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'Erro ao fazer login'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }



  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Card
        maxW="md"
        w="full"
        bg={cardBg}
        shadow="2xl"
        borderRadius="xl"
        overflow="hidden"
      >
        <CardBody p={8}>
          <VStack spacing={6}>
            {/* Logo/Título */}
            <VStack spacing={2} textAlign="center">
              <Icon as={FiUser} boxSize={12} color="blue.500" />
              <Heading size="lg" color={headingColor}>
                Beauty Salon
              </Heading>
              <Text color={textColor} fontSize="sm">
                Sistema de Gerenciamento
              </Text>
            </VStack>



            {/* Formulário de Login */}
            <Box as="form" onSubmit={handleSubmit} w="full">
              <VStack spacing={4}>
                {/* Erro Geral */}
                {errors.general && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">{errors.general}</Text>
                  </Alert>
                )}

                {/* Campo E-mail */}
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel color={textColor}>E-mail</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FiMail} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      placeholder="Digite seu e-mail"
                      value={credentials.email}
                      onChange={handleInputChange('email')}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      border="1px"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      _hover={{
                        borderColor: useColorModeValue('gray.300', 'gray.500')
                      }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px blue.500'
                      }}
                    />
                  </InputGroup>
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                {/* Campo Senha */}
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel color={textColor}>Senha</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FiLock} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={credentials.password}
                      onChange={handleInputChange('password')}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      border="1px"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      _hover={{
                        borderColor: useColorModeValue('gray.300', 'gray.500')
                      }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px blue.500'
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        icon={<Icon as={showPassword ? FiEyeOff : FiEye} />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                {/* Botão de Login */}
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={isSubmitting || isLoading}
                  loadingText="Entrando..."
                  _hover={{
                    transform: 'translateY(-1px)',
                    shadow: 'lg'
                  }}
                  transition="all 0.2s"
                >
                  Entrar
                </Button>
              </VStack>
            </Box>


          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}