import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useColorModeValue,
  Heading,
  Card,
  CardBody,
  Spinner,
} from '@chakra-ui/react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { databaseAuthService } from '../services/databaseAuth'
import type { User, UserRole } from '../types'
import { useAuth } from '../contexts/AuthContext'

interface CreateUserForm {
  nome: string
  sobrenome: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  telefone: string
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CreateUserForm>({
    nome: '',
    sobrenome: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'recepcao',
    telefone: ''
  })

  const { user: currentUser } = useAuth()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure()
  const cancelRef = React.useRef(null)

  // Cores do tema
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const headingColor = useColorModeValue('gray.800', 'gray.100')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  // Carregar usuários
  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await databaseAuthService.getUsers()
      setUsers(usersData)
    } catch (error) {
      toast({
        title: 'Erro ao carregar usuários',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      nome: '',
      sobrenome: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'recepcao',
      telefone: ''
    })
    setSelectedUser(null)
  }

  // Abrir modal para criar usuário
  const handleCreate = () => {
    clearForm()
    onOpen()
  }

  // Abrir modal para editar usuário
  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setFormData({
      nome: user.nome,
      sobrenome: user.sobrenome,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      telefone: user.telefone || ''
    })
    onOpen()
  }

  // Validar formulário
  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      toast({
        title: 'Nome é obrigatório',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return false
    }

    if (!formData.sobrenome.trim()) {
      toast({
        title: 'Sobrenome é obrigatório',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return false
    }

    if (!formData.email.trim()) {
      toast({
        title: 'E-mail é obrigatório',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return false
    }

    // Validação de senha apenas para novo usuário ou se senha foi preenchida
    if (!selectedUser || formData.password) {
      if (formData.password.length < 6) {
        toast({
          title: 'Senha deve ter no mínimo 6 caracteres',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return false
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: 'Senhas não coincidem',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return false
      }
    }

    return true
  }

  // Salvar usuário
  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setSubmitting(true)

      if (selectedUser) {
        // Editar usuário existente
        const updateData: any = {
          nome: formData.nome,
          sobrenome: formData.sobrenome,
          email: formData.email,
          role: formData.role,
          telefone: formData.telefone || undefined
        }

        // Incluir senha apenas se foi alterada
        if (formData.password) {
          updateData.password = formData.password
        }

        await databaseAuthService.updateUser(selectedUser.id, updateData)
        
        toast({
          title: 'Usuário atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        // Criar novo usuário
        await databaseAuthService.createUser({
          nome: formData.nome,
          sobrenome: formData.sobrenome,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          telefone: formData.telefone || undefined
        })
        
        toast({
          title: 'Usuário criado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }

      await loadUsers()
      onClose()
    } catch (error) {
      toast({
        title: selectedUser ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Preparar para deletar usuário
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    onDeleteOpen()
  }

  // Confirmar deleção
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      await databaseAuthService.deactivateUser(selectedUser.id)
      
      toast({
        title: 'Usuário desativado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      await loadUsers()
      onDeleteClose()
    } catch (error) {
      toast({
        title: 'Erro ao desativar usuário',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Formatação de data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color={textColor}>Carregando usuários...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Cabeçalho */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color={headingColor}>
              Gerenciamento de Usuários
            </Heading>
            <Text color={textColor}>
              Gerencie usuários do sistema ({users.length} total)
            </Text>
          </VStack>
          <Button
            leftIcon={<Plus size={16} />}
            colorScheme="brand"
            onClick={handleCreate}
          >
            Novo Usuário
          </Button>
        </HStack>

        {/* Tabela de usuários */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody p={0}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Usuário</Th>
                  <Th>E-mail</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Último Login</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar 
                          size="sm" 
                          name={`${user.nome} ${user.sobrenome}`}
                          src={user.avatar_url}
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium" fontSize="sm">
                            {user.nome} {user.sobrenome}
                          </Text>
                          {user.telefone && (
                            <Text fontSize="xs" color={textColor}>
                              {user.telefone}
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{user.email}</Text>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={user.role === 'admin' ? 'purple' : 'blue'}
                        variant="subtle"
                      >
                        {user.role === 'admin' ? 'Administrador' : 'Recepção'}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge 
                        colorScheme={user.ativo ? 'green' : 'red'}
                        variant="subtle"
                      >
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color={textColor}>
                        {user.ultimo_login 
                          ? formatDate(user.ultimo_login)
                          : 'Nunca'
                        }
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Editar usuário"
                          icon={<Edit size={16} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleEdit(user)}
                        />
                        {user.id !== currentUser?.id && (
                          <IconButton
                            aria-label="Desativar usuário"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDeleteClick(user)}
                          />
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>

      {/* Modal de criação/edição */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Nome</FormLabel>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Sobrenome</FormLabel>
                  <Input
                    value={formData.sobrenome}
                    onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                    placeholder="Sobrenome"
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>E-mail</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Telefone</FormLabel>
                  <Input
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  >
                    <option value="recepcao">Recepção</option>
                    <option value="admin">Administrador</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} w="full">
                <FormControl isRequired={!selectedUser}>
                  <FormLabel>
                    {selectedUser ? 'Nova Senha (deixe vazio para não alterar)' : 'Senha'}
                  </FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                  />
                </FormControl>
                <FormControl isRequired={!!formData.password}>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirme a senha"
                  />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              colorScheme="brand" 
              onClick={handleSave}
              isLoading={submitting}
              loadingText={selectedUser ? 'Atualizando...' : 'Criando...'}
            >
              {selectedUser ? 'Atualizar' : 'Criar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog de confirmação de deleção */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Desativar Usuário
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja desativar o usuário{' '}
              <strong>{selectedUser?.nome} {selectedUser?.sobrenome}</strong>?
              Esta ação pode ser revertida reativando o usuário.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Desativar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}