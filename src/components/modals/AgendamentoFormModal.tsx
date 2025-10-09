import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Select,
  Textarea,
  useToast,
  Grid,
  GridItem,
  Text,
  Divider,
  Box,
  useColorModeValue,
  IconButton
} from '@chakra-ui/react';
import { AddIcon, MinusIcon, StarIcon } from '@chakra-ui/icons';

interface Funcionario {
  id: string;
  nome: string;
  sobrenome: string;
  funcao: string;
  email: string;
}

interface Servico {
  id: string;
  nome: string;
  valor_base: number;
  funcionario_responsavel_id: string;
  funcionario?: Funcionario;
}

interface AgendamentoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionarios: Funcionario[];
  servicos: Servico[];
  onSave: (dados: any) => Promise<void>;
}

const HORARIOS_FUNCIONAMENTO = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '20:00', 
  '20:30', '21:00', '21:30', '22:00'
];

export const AgendamentoFormModal: React.FC<AgendamentoFormModalProps> = ({
  isOpen,
  onClose,
  funcionarios,
  servicos,
  onSave
}) => {
  // Cores do dark mode
  const resumoBg = useColorModeValue('gray.50', 'gray.700');
  const resumoTextColor = useColorModeValue('gray.700', 'gray.100');
  const valorColor = useColorModeValue('green.600', 'green.300');
  const tituloColor = useColorModeValue('gray.700', 'gray.200');
  
  const [formData, setFormData] = useState({
    servico_id: '', // Serviço principal (compatibilidade)
    funcionario_id: '', // Funcionário principal (compatibilidade)
    servicos_ids: [] as string[], // Array de serviços selecionados
    funcionarios_ids: [] as string[], // Array de funcionários selecionados
    cliente_nome: '',
    cliente_telefone: '',
    data_agendamento: '',
    horario: '',
    horario_fim: '',
    observacoes: '',
    status: 'AGENDADO'
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    const servicosValidos = formData.servicos_ids.filter(id => id !== '').length > 0;
    const funcionariosValidos = formData.funcionarios_ids.filter(id => id !== '').length > 0;
    
    if (!servicosValidos || !funcionariosValidos || !formData.cliente_nome.trim() || 
        !formData.data_agendamento || !formData.horario) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios e selecione pelo menos um serviço e um funcionário.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validar data não pode ser no passado (usando timezone local)
    const dataAgendamento = criarDataLocal(formData.data_agendamento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataAgendamento < hoje) {
      toast({
        title: 'Data inválida',
        description: 'A data do agendamento não pode ser no passado.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      
      // Limpar formulário
      setFormData({
        servico_id: '',
        funcionario_id: '',
        servicos_ids: [],
        funcionarios_ids: [],
        cliente_nome: '',
        cliente_telefone: '',
        data_agendamento: '',
        horario: '',
        horario_fim: '',
        observacoes: '',
        status: 'AGENDADO'
      });
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funções para gerenciar múltiplos serviços
  const adicionarServico = () => {
    setFormData(prev => ({
      ...prev,
      servicos_ids: [...prev.servicos_ids, '']
    }));
  };

  const removerServico = (index: number) => {
    if (formData.servicos_ids.length > 1) {
      setFormData(prev => {
        const servicoRemovidoId = prev.servicos_ids[index];
        const servicosRestantes = prev.servicos_ids.filter((_, i) => i !== index);
        
        // Encontrar o serviço removido para verificar seu funcionário responsável
        const servicoRemovido = servicos.find(s => s.id === servicoRemovidoId);
        
        let funcionariosAtualizados = [...prev.funcionarios_ids];
        
        // Se o serviço removido tinha um funcionário responsável
        if (servicoRemovido?.funcionario_responsavel_id) {
          const funcionarioResponsavelId = servicoRemovido.funcionario_responsavel_id;
          
          // Verificar se algum dos serviços restantes ainda precisa deste funcionário
          const funcionarioAindaNecessario = servicosRestantes.some(servicoId => {
            const servico = servicos.find(s => s.id === servicoId);
            return servico?.funcionario_responsavel_id === funcionarioResponsavelId;
          });
          
          // Se o funcionário não é mais necessário, removê-lo
          if (!funcionarioAindaNecessario) {
            funcionariosAtualizados = funcionariosAtualizados.filter(id => id !== funcionarioResponsavelId);
          }
        }
        
        const novoFormData = {
          ...prev,
          servicos_ids: servicosRestantes,
          funcionarios_ids: funcionariosAtualizados
        };
        
        // Atualizar campos de compatibilidade
        if (servicosRestantes.length > 0) {
          novoFormData.servico_id = servicosRestantes[0];
        }
        if (funcionariosAtualizados.length > 0) {
          novoFormData.funcionario_id = funcionariosAtualizados[0];
        }
        
        return novoFormData;
      });
    }
  };

  const alterarServico = (index: number, servicoId: string) => {
    // Encontrar o serviço selecionado para obter o funcionário responsável
    const servicoSelecionado = servicos.find(s => s.id === servicoId);
    
    setFormData(prev => {
      const novoFormData = {
        ...prev,
        servicos_ids: prev.servicos_ids.map((id, i) => i === index ? servicoId : id),
        // Atualizar o serviço principal para compatibilidade
        servico_id: index === 0 ? servicoId : prev.servico_id || (prev.servicos_ids.length > 0 ? prev.servicos_ids[0] : servicoId)
      };

      // Auto-selecionar funcionário responsável se o serviço tem um funcionário definido
      if (servicoSelecionado?.funcionario_responsavel_id) {
        const funcionarioResponsavelId = servicoSelecionado.funcionario_responsavel_id;
        
        // Verificar se o funcionário responsável já está na lista
        const jaTemFuncionario = novoFormData.funcionarios_ids.includes(funcionarioResponsavelId);
        
        if (!jaTemFuncionario) {
          // Se não há funcionários selecionados ou o primeiro está vazio
          if (novoFormData.funcionarios_ids.length === 0 || !novoFormData.funcionarios_ids[0]) {
            novoFormData.funcionarios_ids = [funcionarioResponsavelId];
          } else {
            // Adicionar o funcionário responsável à lista
            novoFormData.funcionarios_ids = [...novoFormData.funcionarios_ids, funcionarioResponsavelId];
          }
          
          // Atualizar funcionário principal para compatibilidade
          if (index === 0) {
            novoFormData.funcionario_id = funcionarioResponsavelId;
          }
        }
      }

      return novoFormData;
    });
  };

  // Funções para gerenciar múltiplos funcionários
  const adicionarFuncionario = () => {
    setFormData(prev => ({
      ...prev,
      funcionarios_ids: [...prev.funcionarios_ids, '']
    }));
  };

  const removerFuncionario = (index: number) => {
    if (formData.funcionarios_ids.length > 1) {
      setFormData(prev => ({
        ...prev,
        funcionarios_ids: prev.funcionarios_ids.filter((_, i) => i !== index)
      }));
    }
  };

  const alterarFuncionario = (index: number, funcionarioId: string) => {
    setFormData(prev => ({
      ...prev,
      funcionarios_ids: prev.funcionarios_ids.map((id, i) => i === index ? funcionarioId : id),
      // Atualizar o funcionário principal para compatibilidade
      funcionario_id: index === 0 ? funcionarioId : prev.funcionario_id || (prev.funcionarios_ids.length > 0 ? prev.funcionarios_ids[0] : funcionarioId)
    }));
  };

  // Funções para múltiplos serviços/funcionários
  const getServicosSelecionados = () => {
    return formData.servicos_ids
      .filter(id => id !== '')
      .map(id => servicos.find(s => s.id === id))
      .filter(Boolean) as Servico[];
  };

  const getFuncionariosSelecionados = () => {
    return formData.funcionarios_ids
      .filter(id => id !== '')
      .map(id => funcionarios.find(f => f.id === id))
      .filter(Boolean) as Funcionario[];
  };

  const calcularValorTotal = () => {
    return getServicosSelecionados().reduce((total, servico) => total + servico.valor_base, 0);
  };

  // Verificar se um funcionário foi selecionado automaticamente
  const isFuncionarioAutoSelecionado = (funcionarioId: string) => {
    return getServicosSelecionados().some(servico => 
      servico.funcionario_responsavel_id === funcionarioId
    );
  };

  // Função para obter data local sem problemas de timezone
  const getDataLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Função para criar data local a partir de string (evita problemas de timezone)
  const criarDataLocal = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Data mínima é hoje (timezone local)
  const dataMinima = getDataLocal(new Date());

  // Função para calcular duração entre horários
  const calcularDuracao = (inicio: string, fim: string) => {
    if (!inicio || !fim) return '';
    
    const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
    const [horaFim, minutoFim] = fim.split(':').map(Number);
    
    const minutosInicio = horaInicio * 60 + minutoInicio;
    const minutosFim = horaFim * 60 + minutoFim;
    
    const duracao = minutosFim - minutosInicio;
    
    if (duracao <= 0) return 'Inválido';
    
    const horas = Math.floor(duracao / 60);
    const minutos = duracao % 60;
    
    if (horas > 0 && minutos > 0) {
      return `${horas}h ${minutos}min`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else {
      return `${minutos}min`;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'lg' }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="rosa.600">
          Novo Agendamento
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              {/* Informações do Cliente */}
              <Box w="full">
                <Text fontWeight="bold" mb={3} color={tituloColor}>
                  Informações do Cliente
                </Text>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <Input
                        value={formData.cliente_nome}
                        onChange={(e) => handleInputChange('cliente_nome', e.target.value)}
                        placeholder="Digite o nome completo"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Telefone</FormLabel>
                      <Input
                        value={formData.cliente_telefone}
                        onChange={(e) => handleInputChange('cliente_telefone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </Box>

              <Divider />

              {/* Serviços e Funcionários */}
              <Box w="full">
                <Text fontWeight="bold" mb={3} color={tituloColor}>
                  Serviços e Responsáveis
                </Text>
                
                {/* Múltiplos Serviços */}
                <Box mb={4}>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium" color={tituloColor}>
                      Serviços
                    </Text>
                    <Button
                      size="xs"
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={adicionarServico}
                    >
                      Adicionar Serviço
                    </Button>
                  </HStack>
                  
                  {formData.servicos_ids.length === 0 ? (
                    <Box p={4} border="2px dashed" borderColor="gray.300" borderRadius="md" textAlign="center">
                      <Text fontSize="sm" color="gray.500" mb={2}>
                        Nenhum serviço selecionado
                      </Text>
                      <Button
                        size="sm"
                        leftIcon={<AddIcon />}
                        colorScheme="blue"
                        onClick={adicionarServico}
                      >
                        Adicionar Primeiro Serviço
                      </Button>
                    </Box>
                  ) : (
                    <VStack spacing={2}>
                      {formData.servicos_ids.map((servicoId, index) => (
                        <HStack key={index} w="full" spacing={2}>
                          <FormControl isRequired={index === 0}>
                            <Select
                              value={servicoId}
                              onChange={(e) => alterarServico(index, e.target.value)}
                              placeholder={`Selecione o ${index === 0 ? 'serviço principal' : `serviço ${index + 1}`}`}
                            >
                              {servicos.map((servico) => (
                                <option key={servico.id} value={servico.id}>
                                  {servico.nome} - R$ {servico.valor_base.toLocaleString()}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                          {formData.servicos_ids.length > 1 && (
                            <IconButton
                              aria-label="Remover serviço"
                              icon={<MinusIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => removerServico(index)}
                            />
                          )}
                        </HStack>
                      ))}
                    </VStack>
                  )}
                  
                  {getServicosSelecionados().length > 0 && (
                    <Text fontSize="sm" color={valorColor} mt={2}>
                      Valor Total: R$ {calcularValorTotal().toLocaleString()}
                    </Text>
                  )}
                </Box>

                {/* Múltiplos Funcionários */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium" color={tituloColor}>
                      Funcionários
                    </Text>
                    <Button
                      size="xs"
                      leftIcon={<AddIcon />}
                      colorScheme="rosa"
                      variant="outline"
                      onClick={adicionarFuncionario}
                    >
                      Adicionar Funcionário
                    </Button>
                  </HStack>
                  
                  {/* Dica sobre seleção automática */}
                  <Text fontSize="xs" color="gray.500" mb={3}>
                    💡 Funcionários responsáveis são selecionados automaticamente ao escolher serviços <StarIcon color="green.500" w={3} h={3} />
                  </Text>
                  
                  {formData.funcionarios_ids.length === 0 ? (
                    <Box p={4} border="2px dashed" borderColor="gray.300" borderRadius="md" textAlign="center">
                      <Text fontSize="sm" color="gray.500" mb={2}>
                        Nenhum funcionário selecionado
                      </Text>
                      <Button
                        size="sm"
                        leftIcon={<AddIcon />}
                        colorScheme="rosa"
                        onClick={adicionarFuncionario}
                      >
                        Adicionar Primeiro Funcionário
                      </Button>
                    </Box>
                  ) : (
                    <VStack spacing={2}>
                      {formData.funcionarios_ids.map((funcionarioId, index) => (
                        <HStack key={index} w="full" spacing={2}>
                          <FormControl isRequired={index === 0} flex={1}>
                            <HStack>
                              <Select
                                value={funcionarioId}
                                onChange={(e) => alterarFuncionario(index, e.target.value)}
                                placeholder={`Selecione o ${index === 0 ? 'funcionário principal' : `funcionário ${index + 1}`}`}
                                flex={1}
                              >
                                {funcionarios.map((funcionario) => (
                                  <option key={funcionario.id} value={funcionario.id}>
                                    {funcionario.nome} {funcionario.sobrenome} - {funcionario.funcao}
                                  </option>
                                ))}
                              </Select>
                              {funcionarioId && isFuncionarioAutoSelecionado(funcionarioId) && (
                                <StarIcon color="green.500" />
                              )}
                            </HStack>
                          </FormControl>
                          {formData.funcionarios_ids.length > 1 && (
                            <IconButton
                              aria-label="Remover funcionário"
                              icon={<MinusIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => removerFuncionario(index)}
                            />
                          )}
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Box>
              </Box>

              <Divider />

              {/* Data e Horário */}
              <Box w="full">
                <Text fontWeight="bold" mb={3} color={tituloColor}>
                  Data e Horário
                </Text>
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Data do Agendamento</FormLabel>
                      <Input
                        type="date"
                        value={formData.data_agendamento}
                        onChange={(e) => handleInputChange('data_agendamento', e.target.value)}
                        min={dataMinima}
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Horário de Início</FormLabel>
                      <Select
                        value={formData.horario}
                        onChange={(e) => handleInputChange('horario', e.target.value)}
                        placeholder="Selecione o horário"
                      >
                        {HORARIOS_FUNCIONAMENTO.map((horario) => (
                          <option key={horario} value={horario}>
                            {horario}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Horário de Término</FormLabel>
                      <Select
                        value={formData.horario_fim}
                        onChange={(e) => handleInputChange('horario_fim', e.target.value)}
                        placeholder="Selecione o término"
                        isDisabled={!formData.horario}
                      >
                        {HORARIOS_FUNCIONAMENTO
                          .filter(horario => formData.horario ? horario > formData.horario : true)
                          .map((horario) => (
                            <option key={horario} value={horario}>
                              {horario}
                            </option>
                          ))}
                      </Select>
                      {formData.horario && formData.horario_fim && (
                        <Text fontSize="sm" color="blue.500" mt={1}>
                          Duração: {calcularDuracao(formData.horario, formData.horario_fim)}
                        </Text>
                      )}
                    </FormControl>
                  </GridItem>
                </Grid>
              </Box>

              {/* Observações */}
              <FormControl w="full">
                <FormLabel>Observações</FormLabel>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Observações especiais, alergias, preferências..."
                  rows={3}
                />
              </FormControl>

              {/* Resumo do Agendamento */}
              {getServicosSelecionados().length > 0 && getFuncionariosSelecionados().length > 0 && formData.data_agendamento && formData.horario && (
                <Box w="full" p={4} bg={resumoBg} borderRadius="md">
                  <Text fontWeight="bold" mb={2} color={resumoTextColor}>
                    Resumo do Agendamento
                  </Text>
                  <VStack spacing={1} align="flex-start">
                    <Text fontSize="sm" color={resumoTextColor}>
                      <strong>Cliente:</strong> {formData.cliente_nome}
                    </Text>
                    
                    {/* Múltiplos Serviços */}
                    <Box>
                      <Text fontSize="sm" color={resumoTextColor}>
                        <strong>Serviços:</strong>
                      </Text>
                      <VStack spacing={0} align="flex-start" ml={4}>
                        {getServicosSelecionados().map((servico) => (
                          <Text key={servico.id} fontSize="xs" color={resumoTextColor}>
                            • {servico.nome} - R$ {servico.valor_base.toLocaleString()}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                    
                    {/* Múltiplos Funcionários */}
                    <Box>
                      <Text fontSize="sm" color={resumoTextColor}>
                        <strong>Funcionários:</strong>
                      </Text>
                      <VStack spacing={0} align="flex-start" ml={4}>
                        {getFuncionariosSelecionados().map((funcionario, index) => (
                          <Text key={funcionario.id} fontSize="xs" color={resumoTextColor}>
                            • {funcionario.nome} {funcionario.sobrenome} ({funcionario.funcao})
                            {index === 0 && <Text as="span" color="blue.500" ml={1}>(Principal)</Text>}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                    
                    <Text fontSize="sm" color={resumoTextColor}>
                      <strong>Data:</strong> {criarDataLocal(formData.data_agendamento).toLocaleDateString('pt-BR')}
                    </Text>
                    <Text fontSize="sm" color={resumoTextColor}>
                      <strong>Horário:</strong> {formData.horario}
                      {formData.horario_fim && ` - ${formData.horario_fim}`}
                      {formData.horario && formData.horario_fim && (
                        <Text as="span" color="blue.500" ml={2}>
                          ({calcularDuracao(formData.horario, formData.horario_fim)})
                        </Text>
                      )}
                    </Text>
                    <Text fontSize="sm" color={valorColor} fontWeight="bold">
                      <strong>Valor Total:</strong> R$ {calcularValorTotal().toLocaleString()}
                    </Text>
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="rosa"
                isLoading={loading}
                loadingText="Agendando..."
              >
                Criar Agendamento
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
