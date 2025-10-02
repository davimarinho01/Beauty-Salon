import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Input,
  FormControl,
  FormLabel,
  Divider,
  Icon,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react'
import { 
  Trash2, 
  Database, 
  AlertTriangle,
  Settings,
  Calendar,
  Users,
  DollarSign,
  Scissors,
  Plus,
  RefreshCw
} from 'lucide-react'
import { databaseService } from '../services/database'
import { googleCalendarService } from '../services/googleCalendar'

export const Configuracoes = () => {
  const [resetando, setResetando] = useState(false)
  const [inserindoDados, setInserindoDados] = useState(false)
  const [carregandoStats, setCarregandoStats] = useState(true)
  const [stats, setStats] = useState({
    funcionarios: 0,
    servicos: 0,
    movimentacoes: 0,
    agendamentos: 0,
    total: 0
  })
  const [confirmText, setConfirmText] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  // Cores do modo escuro/claro
  const bgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'gray.100')
  const headingColor = useColorModeValue('neutral.800', 'gray.100')
  const mutedTextColor = useColorModeValue('neutral.600', 'gray.400')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Carregar estatísticas do banco
  const carregarEstatisticas = async () => {
    setCarregandoStats(true)
    try {
      const estatisticas = await databaseService.getDatabaseStats()
      setStats(estatisticas)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setCarregandoStats(false)
    }
  }

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  const handleInserirDadosExemplo = async () => {
    setInserindoDados(true)
    try {
      await databaseService.insertSampleData()
      
      toast({
        title: 'Dados de exemplo inseridos!',
        description: 'Funcionários, serviços e movimentações de exemplo foram adicionados.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      // Recarregar estatísticas
      await carregarEstatisticas()
      
    } catch (error) {
      console.error('Erro ao inserir dados:', error)
      toast({
        title: 'Erro ao inserir dados',
        description: 'Não foi possível inserir os dados de exemplo.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setInserindoDados(false)
    }
  }

  const handleResetDatabase = async () => {
    if (confirmText !== 'RESETAR TUDO') {
      toast({
        title: 'Confirmação incorreta',
        description: 'Digite exatamente "RESETAR TUDO" para confirmar.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setResetando(true)
    try {
      await databaseService.resetAllData()
      
      toast({
        title: 'Banco de dados resetado!',
        description: 'Todos os dados foram removidos com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      onClose()
      setConfirmText('')
      
      // Opcional: recarregar a página para limpar o estado da aplicação
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      console.error('Erro ao resetar banco:', error)
      toast({
        title: 'Erro ao resetar',
        description: 'Não foi possível resetar o banco de dados. Verifique a conexão.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setResetando(false)
    }
  }

  const isGoogleConnected = googleCalendarService.isConnected()

  return (
    <Box bg={bgColor} color={textColor} minH="100vh" p={6}>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color={headingColor}>
              <Icon as={Settings} mr={3} />
              Configurações do Sistema
            </Heading>
            <Text color={mutedTextColor}>
              Gerencie configurações e dados do sistema
            </Text>
          </VStack>
        </HStack>

        {/* Estatísticas do Banco */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Heading size="md" color={headingColor}>
                  <Icon as={Database} mr={2} />
                  Estatísticas do Banco de Dados
                </Heading>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={carregarEstatisticas}
                  isLoading={carregandoStats}
                  leftIcon={<RefreshCw size={16} />}
                >
                  Atualizar
                </Button>
              </HStack>
              
              <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>
                    <HStack>
                      <Icon as={Users} size={16} />
                      <Text>Funcionários</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="purple.600">{stats.funcionarios}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>
                    <HStack>
                      <Icon as={Scissors} size={16} />
                      <Text>Serviços</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="purple.600">{stats.servicos}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>
                    <HStack>
                      <Icon as={DollarSign} size={16} />
                      <Text>Movimentações</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="purple.600">{stats.movimentacoes}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>
                    <HStack>
                      <Icon as={Calendar} size={16} />
                      <Text>Agendamentos</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="purple.600">{stats.agendamentos}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel fontSize="sm" color={mutedTextColor}>
                    <HStack>
                      <Icon as={Database} size={16} />
                      <Text>Total</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="purple.600">{stats.total}</StatNumber>
                </Stat>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* Dados de Teste */}
        <Card bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md" color={headingColor}>
                <Icon as={Plus} mr={2} />
                Dados de Teste
              </Heading>
              
              <Text color={mutedTextColor} fontSize="sm">
                Adicione dados de exemplo para testar o sistema com informações fictícias.
              </Text>
              
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Dados de Exemplo</AlertTitle>
                  <AlertDescription>
                    Serão inseridos funcionários, serviços e movimentações financeiras de exemplo.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <Button
                leftIcon={<Plus size={16} />}
                colorScheme="blue"
                onClick={handleInserirDadosExemplo}
                isLoading={inserindoDados}
                loadingText="Inserindo dados..."
                size="sm"
                alignSelf="flex-start"
              >
                Inserir Dados de Exemplo
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Status do Sistema */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md" color={headingColor}>
                Status do Sistema
              </Heading>
              
              <HStack justify="space-between">
                <HStack>
                  <Icon as={Database} color="green.500" />
                  <Text>Banco de Dados (Supabase)</Text>
                </HStack>
                <Badge colorScheme="green">Conectado</Badge>
              </HStack>
              
              <HStack justify="space-between">
                <HStack>
                  <Icon as={Calendar} color={isGoogleConnected ? "green.500" : "gray.400"} />
                  <Text>Google Calendar</Text>
                </HStack>
                <Badge colorScheme={isGoogleConnected ? "green" : "gray"}>
                  {isGoogleConnected ? "Conectado" : "Desconectado"}
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Seção Perigosa - Reset de Dados */}
        <Card borderColor="red.200" borderWidth="2px">
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Icon as={AlertTriangle} color="red.500" />
                <Heading size="md" color="red.600">
                  Zona Perigosa
                </Heading>
              </HStack>
              
              <Alert status="warning">
                <AlertIcon />
                <Box>
                  <AlertTitle>Atenção!</AlertTitle>
                  <AlertDescription>
                    As ações desta seção são irreversíveis e podem causar perda total de dados.
                  </AlertDescription>
                </Box>
              </Alert>

              <Divider />

              <VStack align="stretch" spacing={3}>
                <Text fontWeight="bold" color={headingColor}>
                  Resetar Banco de Dados
                </Text>
                <Text color={mutedTextColor} fontSize="sm">
                  Remove TODOS os dados do sistema:
                </Text>
                <VStack align="start" spacing={1} pl={4}>
                  <HStack>
                    <Icon as={Users} size={16} color="red.500" />
                    <Text fontSize="sm">• Todos os funcionários</Text>
                  </HStack>
                  <HStack>
                    <Icon as={Settings} size={16} color="red.500" />
                    <Text fontSize="sm">• Todos os serviços</Text>
                  </HStack>
                  <HStack>
                    <Icon as={DollarSign} size={16} color="red.500" />
                    <Text fontSize="sm">• Todas as movimentações financeiras</Text>
                  </HStack>
                  <HStack>
                    <Icon as={Calendar} size={16} color="red.500" />
                    <Text fontSize="sm">• Todos os agendamentos</Text>
                  </HStack>
                </VStack>
                
                <Button
                  leftIcon={<Trash2 size={16} />}
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                  onClick={onOpen}
                  _hover={{ bg: 'red.50' }}
                >
                  Resetar Todos os Dados
                </Button>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Modal de Confirmação */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader color="red.600">
              <Icon as={AlertTriangle} mr={2} />
              Confirmar Reset do Banco
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="error">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>AÇÃO IRREVERSÍVEL!</AlertTitle>
                    <AlertDescription>
                      Esta ação irá deletar TODOS os dados do sistema permanentemente.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Text>
                  Para confirmar, digite exatamente: <strong>RESETAR TUDO</strong>
                </Text>
                
                <FormControl>
                  <FormLabel>Confirmação</FormLabel>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Digite: RESETAR TUDO"
                    bg={confirmText === 'RESETAR TUDO' ? 'red.50' : 'white'}
                    borderColor={confirmText === 'RESETAR TUDO' ? 'red.300' : 'gray.200'}
                  />
                </FormControl>
                
                <Text fontSize="sm" color={mutedTextColor}>
                  💡 Dica: Esta funcionalidade é útil para testes ou para começar com um sistema limpo.
                </Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={handleResetDatabase}
                isLoading={resetando}
                loadingText="Resetando..."
                disabled={confirmText !== 'RESETAR TUDO'}
              >
                Resetar Banco de Dados
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  )
}
