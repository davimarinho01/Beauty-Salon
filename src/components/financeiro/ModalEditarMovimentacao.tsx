import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  HStack,
  Text,
  Badge,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { financeiroService, funcionarioService, servicoService } from '../../services/api'
import type { MovimentacaoFinanceira, Funcionario, Servico, MetodoPagamento } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  movimentacao: MovimentacaoFinanceira
  onSuccess: () => void
}

export const ModalEditarMovimentacao = ({ isOpen, onClose, movimentacao, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false)
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  
  const [formulario, setFormulario] = useState({
    valor: movimentacao.valor,
    descricao: movimentacao.descricao,
    metodo_pagamento: movimentacao.metodo_pagamento || '',
    funcionario_id: movimentacao.funcionario_id || '',
    servico_id: movimentacao.servico_id || '',
    cliente_nome: movimentacao.cliente_nome || ''
  })

  const toast = useToast()

  // Carregar dados
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
      }
    }

    if (isOpen) {
      carregarDados()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    try {
      await financeiroService.update(movimentacao.id, {
        valor: formulario.valor,
        descricao: formulario.descricao,
        metodo_pagamento: formulario.metodo_pagamento as MetodoPagamento || null,
        funcionario_id: formulario.funcionario_id || undefined,
        servico_id: formulario.servico_id || undefined,
        cliente_nome: formulario.cliente_nome || undefined
      })

      toast({
        title: 'Movimentação atualizada!',
        description: 'As alterações foram salvas com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Tente novamente em alguns instantes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Text>Editar Movimentação</Text>
            <Badge colorScheme={movimentacao.tipo === 'ENTRADA' ? 'green' : 'red'}>
              {movimentacao.tipo}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Valor</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formulario.valor}
                  onChange={(e) => setFormulario(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Descrição</FormLabel>
                <Textarea
                  value={formulario.descricao}
                  onChange={(e) => setFormulario(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />
              </FormControl>

              {movimentacao.tipo === 'ENTRADA' && (
                <>
                  <FormControl>
                    <FormLabel>Funcionário</FormLabel>
                    <Select
                      value={formulario.funcionario_id}
                      onChange={(e) => setFormulario(prev => ({ ...prev, funcionario_id: e.target.value }))}
                      placeholder="Selecione o funcionário"
                    >
                      {funcionarios.map(funcionario => (
                        <option key={funcionario.id} value={funcionario.id}>
                          {funcionario.nome} {funcionario.sobrenome}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Serviço</FormLabel>
                    <Select
                      value={formulario.servico_id}
                      onChange={(e) => setFormulario(prev => ({ ...prev, servico_id: e.target.value }))}
                      placeholder="Selecione o serviço"
                    >
                      {servicos.map(servico => (
                        <option key={servico.id} value={servico.id}>
                          {servico.nome}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

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
                      onChange={(e) => setFormulario(prev => ({ ...prev, metodo_pagamento: e.target.value }))}
                      placeholder="Selecione o método"
                    >
                      <option value="PIX">PIX</option>
                      <option value="DINHEIRO">Dinheiro</option>
                      <option value="CREDITO">Cartão de Crédito</option>
                      <option value="DEBITO">Cartão de Débito</option>
                    </Select>
                  </FormControl>
                </>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText="Salvando..."
            >
              Salvar Alterações
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}