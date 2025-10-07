import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Tooltip,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Edit3,
  Trash2,
  Filter,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { FormularioEntrada } from '../components/financeiro/FormularioEntrada'
import { FormularioSaida } from '../components/financeiro/FormularioSaida'
import { ModalEditarMovimentacao } from '../components/financeiro/ModalEditarMovimentacao'
import { financeiroService } from '../services/api'
import type { MovimentacaoFinanceira } from '../types'

export const Financeiro = () => {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFinanceira[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [movimentacaoSelecionada, setMovimentacaoSelecionada] = useState<MovimentacaoFinanceira | null>(null)
  
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()

  // Carregar movimentações
  const carregarMovimentacoes = async () => {
    try {
      setLoading(true)
      const dados = await financeiroService.getMovimentacoes(50) // Últimas 50
      setMovimentacoes(dados)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar movimentações. Verifique a conexão com o banco.')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarMovimentacoes()
  }, [])

  // Handlers para operações
  const handleNovaEntrada = async (entrada: any) => {
    try {
      await financeiroService.criarEntrada(entrada)
      await carregarMovimentacoes() // Recarregar lista
    } catch (err) {
      console.error('Erro ao criar entrada:', err)
    }
  }

  const handleNovaSaida = async (saida: any) => {
    try {
      await financeiroService.criarSaida(saida)
      await carregarMovimentacoes() // Recarregar lista
    } catch (err) {
      console.error('Erro ao criar saída:', err)
    }
  }

  const handleEditarMovimentacao = (movimentacao: MovimentacaoFinanceira) => {
    setMovimentacaoSelecionada(movimentacao)
    onEditOpen()
  }

  const handleExcluirMovimentacao = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
      try {
        await financeiroService.delete(id)
        await carregarMovimentacoes() // Recarregar lista
      } catch (err) {
        console.error('Erro ao excluir movimentação:', err)
      }
    }
  }

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (error) {
    return (
      <Box>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Erro de Conexão!</AlertTitle>
            <AlertDescription>
              {error}
              <br />
              <Text fontSize="sm" mt={2} color="gray.600">
                💡 Para conectar com o banco:
                <br />
                1. Crie uma conta gratuita no <strong>Supabase</strong>
                <br />
                2. Configure as variáveis no arquivo <code>.env</code>
                <br />
                3. Execute o script SQL em <code>database/schema.sql</code>
              </Text>
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="neutral.800">
              Controle Financeiro
            </Heading>
            <Text color="neutral.600">
              Gerencie entradas, saídas e movimentações
            </Text>
          </VStack>
          
          <HStack spacing={3}>
            <Button
              leftIcon={<Icon as={Filter} />}
              variant="outline"
              colorScheme="brand"
            >
              Filtros
            </Button>
          </HStack>
        </HStack>

        {/* Tabs principais */}
        <Tabs colorScheme="brand" variant="enclosed">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <Icon as={TrendingUp} w={4} h={4} />
                <Text>Entradas</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <Icon as={TrendingDown} w={4} h={4} />
                <Text>Saídas</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Aba Entradas */}
            <TabPanel px={0}>
              <FormularioEntrada onSuccess={handleNovaEntrada} />
            </TabPanel>

            {/* Aba Saídas */}
            <TabPanel px={0}>
              <FormularioSaida onSuccess={handleNovaSaida} />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Lista de Movimentações */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Heading size="md" color="neutral.800">
                  Últimas Movimentações
                </Heading>
                <Button
                  size="sm"
                  leftIcon={<Icon as={Plus} />}
                  colorScheme="brand"
                  onClick={carregarMovimentacoes}
                >
                  Atualizar
                </Button>
              </HStack>

              {loading ? (
                <Text color="neutral.500" textAlign="center" py={8}>
                  Carregando movimentações...
                </Text>
              ) : movimentacoes.length === 0 ? (
                <Text color="neutral.500" textAlign="center" py={8}>
                  Nenhuma movimentação encontrada.
                </Text>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Data</Th>
                        <Th>Tipo</Th>
                        <Th>Descrição</Th>
                        <Th>Funcionário</Th>
                        <Th>Cliente</Th>
                        <Th>Pagamento</Th>
                        <Th isNumeric>Valor</Th>
                        <Th>Ações</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {movimentacoes.map((movimentacao) => (
                        <Tr key={movimentacao.id}>
                          <Td fontSize="sm">
                            {formatarData(movimentacao.data_movimentacao)}
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={movimentacao.tipo === 'ENTRADA' ? 'green' : 'red'}
                              variant="subtle"
                            >
                              {movimentacao.tipo}
                            </Badge>
                          </Td>
                          <Td fontSize="sm" maxW="200px" isTruncated>
                            {movimentacao.descricao}
                          </Td>
                          <Td fontSize="sm">
                            {movimentacao.funcionario ? 
                              `${movimentacao.funcionario.nome} ${movimentacao.funcionario.sobrenome}` : 
                              '-'
                            }
                          </Td>
                          <Td fontSize="sm">
                            {movimentacao.cliente_nome || '-'}
                          </Td>
                          <Td>
                            {movimentacao.metodo_pagamento ? (
                              <Badge variant="outline" fontSize="xs">
                                {movimentacao.metodo_pagamento}
                              </Badge>
                            ) : '-'}
                          </Td>
                          <Td isNumeric fontWeight="semibold">
                            <Text color={movimentacao.tipo === 'ENTRADA' ? 'green.600' : 'red.600'}>
                              {movimentacao.tipo === 'ENTRADA' ? '+' : '-'} {formatarValor(movimentacao.valor)}
                            </Text>
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <Tooltip label="Editar">
                                <IconButton
                                  aria-label="Editar"
                                  icon={<Icon as={Edit3} />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleEditarMovimentacao(movimentacao)}
                                />
                              </Tooltip>
                              <Tooltip label="Excluir">
                                <IconButton
                                  aria-label="Excluir"
                                  icon={<Icon as={Trash2} />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleExcluirMovimentacao(movimentacao.id)}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Modal de Edição */}
      {movimentacaoSelecionada && (
        <ModalEditarMovimentacao
          isOpen={isEditOpen}
          onClose={onEditClose}
          movimentacao={movimentacaoSelecionada}
          onSuccess={carregarMovimentacoes}
        />
      )}
    </Box>
  )
}
