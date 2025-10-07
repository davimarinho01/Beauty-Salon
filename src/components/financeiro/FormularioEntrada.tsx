import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Icon,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react'
import { DollarSign, Save, User, Scissors } from 'lucide-react'
import { useState, useEffect } from 'react'
import { funcionarioService, servicoService } from '../../services/api'
import type { Funcionario, Servico, FormularioEntrada as FormEntrada, MetodoPagamento } from '../../types'

interface Props {
  onSuccess: (entrada: FormEntrada) => Promise<void>
}

export const FormularioEntrada = ({ onSuccess }: Props) => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  
  const [formulario, setFormulario] = useState<FormEntrada>({
    funcionario_id: '',
    valor: 0,
    servico_id: '',
    cliente_nome: '',
    metodo_pagamento: 'PIX',
    data_movimentacao: new Date().toISOString().split('T')[0] // Data atual por padrão
  })

  const toast = useToast()

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [funcionariosData, servicosData] = await Promise.all([
          funcionarioService.getAll(),
          servicoService.getAll()
        ])
        setFuncionarios(funcionariosData)
        setServicos(servicosData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: 'Erro ao carregar dados',
          description: 'Verifique a conexão com o banco',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoadingData(false)
      }
    }

    carregarDados()
  }, [toast])

  // Atualizar valor quando serviço mudar
  useEffect(() => {
    if (formulario.servico_id) {
      const servico = servicos.find(s => s.id === formulario.servico_id)
      if (servico) {
        setFormulario(prev => ({ ...prev, valor: servico.valor_base }))
      }
    }
  }, [formulario.servico_id, servicos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formulario.funcionario_id || !formulario.servico_id || !formulario.cliente_nome || formulario.valor <= 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    try {
      // Corrigir timezone da data se ela foi fornecida
      let dataMovimentacao = formulario.data_movimentacao;
      if (dataMovimentacao) {
        // Criar data no horário local brasileiro (meio-dia para evitar problemas de timezone)
        const [ano, mes, dia] = dataMovimentacao.split('-');
        const dataLocal = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 12, 0, 0);
        dataMovimentacao = dataLocal.toISOString();
      } else {
        // Se não foi fornecida, usar data atual
        const hoje = new Date();
        dataMovimentacao = hoje.toISOString();
      }

      const dadosFinais = {
        ...formulario,
        data_movimentacao: dataMovimentacao
      };

      await onSuccess(dadosFinais);
      
      // Limpar formulário
      setFormulario({
        funcionario_id: '',
        valor: 0,
        servico_id: '',
        cliente_nome: '',
        metodo_pagamento: 'PIX'
      })

      toast({
        title: 'Entrada registrada!',
        description: 'Movimentação criada com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao registrar entrada',
        description: 'Tente novamente em alguns instantes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <Card>
        <CardBody>
          <Text textAlign="center" color="neutral.500" py={8}>
            Carregando formulário...
          </Text>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <HStack spacing={3}>
              <Icon as={DollarSign} w={5} h={5} color="green.500" />
              <Text fontSize="lg" fontWeight="semibold" color="neutral.800">
                Registrar Nova Entrada
              </Text>
            </HStack>

            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Text>📅</Text>
                      <Text>Data da Movimentação</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="date"
                    value={formulario.data_movimentacao}
                    onChange={(e) => setFormulario(prev => ({ ...prev, data_movimentacao: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]} // Não permite datas futuras
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={User} w={4} h={4} />
                      <Text>Funcionário</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    value={formulario.funcionario_id}
                    onChange={(e) => setFormulario(prev => ({ ...prev, funcionario_id: e.target.value }))}
                    placeholder="Selecione o funcionário"
                  >
                    {funcionarios.map(funcionario => (
                      <option key={funcionario.id} value={funcionario.id}>
                        {funcionario.nome} {funcionario.sobrenome} - {funcionario.funcao}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={Scissors} w={4} h={4} />
                      <Text>Serviço</Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    value={formulario.servico_id}
                    onChange={(e) => setFormulario(prev => ({ ...prev, servico_id: e.target.value }))}
                    placeholder="Selecione o serviço"
                  >
                    {servicos.map(servico => (
                      <option key={servico.id} value={servico.id}>
                        {servico.nome} - R$ {servico.valor_base.toFixed(2)}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Valor</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formulario.valor}
                    onChange={(e) => setFormulario(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Cliente</FormLabel>
                  <Input
                    value={formulario.cliente_nome}
                    onChange={(e) => setFormulario(prev => ({ ...prev, cliente_nome: e.target.value }))}
                    placeholder="Nome do cliente"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select
                    value={formulario.metodo_pagamento}
                    onChange={(e) => setFormulario(prev => ({ ...prev, metodo_pagamento: e.target.value as MetodoPagamento }))}
                  >
                    <option value="PIX">PIX</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="CREDITO">Cartão de Crédito</option>
                    <option value="DEBITO">Cartão de Débito</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </VStack>

            <HStack justify="flex-end" spacing={3}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormulario({
                  funcionario_id: '',
                  valor: 0,
                  servico_id: '',
                  cliente_nome: '',
                  metodo_pagamento: 'PIX'
                })}
              >
                Limpar
              </Button>
              <Button
                type="submit"
                colorScheme="green"
                leftIcon={<Icon as={Save} />}
                isLoading={loading}
                loadingText="Salvando..."
              >
                Registrar Entrada
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  )
}
