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
  useColorModeValue
} from '@chakra-ui/react';

interface Funcionario {
  id: string;
  nome: string;
  sobrenome: string;
  funcao: string;
}

interface Servico {
  id: string;
  nome: string;
  valor_base: number;
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
  '17:00', '17:30', '18:00', '18:30', '19:00'
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
    servico_id: '',
    funcionario_id: '',
    cliente_nome: '',
    cliente_telefone: '',
    data_agendamento: '',
    horario: '',
    observacoes: '',
    status: 'AGENDADO'
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.servico_id || !formData.funcionario_id || !formData.cliente_nome.trim() || 
        !formData.data_agendamento || !formData.horario) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validar data não pode ser no passado
    const dataAgendamento = new Date(formData.data_agendamento);
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
        cliente_nome: '',
        cliente_telefone: '',
        data_agendamento: '',
        horario: '',
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

  const getServicoSelecionado = () => {
    return servicos.find(s => s.id === formData.servico_id);
  };

  const getFuncionarioSelecionado = () => {
    return funcionarios.find(f => f.id === formData.funcionario_id);
  };

  // Data mínima é hoje
  const dataMinima = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
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
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
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

              {/* Serviço e Funcionário */}
              <Box w="full">
                <Text fontWeight="bold" mb={3} color={tituloColor}>
                  Serviço e Responsável
                </Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Serviço</FormLabel>
                      <Select
                        value={formData.servico_id}
                        onChange={(e) => handleInputChange('servico_id', e.target.value)}
                        placeholder="Selecione o serviço"
                      >
                        {servicos.map((servico) => (
                          <option key={servico.id} value={servico.id}>
                            {servico.nome} - R$ {servico.valor_base.toLocaleString()}
                          </option>
                        ))}
                      </Select>
                      {getServicoSelecionado() && (
                        <Text fontSize="sm" color={valorColor} mt={1}>
                          Valor: R$ {getServicoSelecionado()!.valor_base.toLocaleString()}
                        </Text>
                      )}
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Funcionário</FormLabel>
                      <Select
                        value={formData.funcionario_id}
                        onChange={(e) => handleInputChange('funcionario_id', e.target.value)}
                        placeholder="Selecione o funcionário"
                      >
                        {funcionarios.map((funcionario) => (
                          <option key={funcionario.id} value={funcionario.id}>
                            {funcionario.nome} {funcionario.sobrenome} - {funcionario.funcao}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </GridItem>
                </Grid>
              </Box>

              <Divider />

              {/* Data e Horário */}
              <Box w="full">
                <Text fontWeight="bold" mb={3} color={tituloColor}>
                  Data e Horário
                </Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
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
                      <FormLabel>Horário</FormLabel>
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
              {formData.servico_id && formData.funcionario_id && formData.data_agendamento && formData.horario && (
                <Box w="full" p={4} bg={resumoBg} borderRadius="md">
                  <Text fontWeight="bold" mb={2} color={resumoTextColor}>
                    Resumo do Agendamento
                  </Text>
                  <VStack spacing={1} align="flex-start">
                    <Text fontSize="sm" color={resumoTextColor}>
                      <strong>Cliente:</strong> {formData.cliente_nome}
                    </Text>
                    <Text fontSize="sm" color={resumoTextColor}>
                      <strong>Serviço:</strong> {getServicoSelecionado()?.nome}
                    </Text>
                    <Text fontSize="sm" color={resumoTextColor}>
                      <strong>Funcionário:</strong> {getFuncionarioSelecionado()?.nome} {getFuncionarioSelecionado()?.sobrenome}
                    </Text>
                    <Text fontSize="sm" color={resumoTextColor}>
                      <strong>Data:</strong> {new Date(formData.data_agendamento + 'T00:00:00').toLocaleDateString()}
                    </Text>
                    <Text fontSize="sm" color={resumoTextColor}>
                      <strong>Horário:</strong> {formData.horario}
                    </Text>
                    <Text fontSize="sm" color={valorColor}>
                      <strong>Valor:</strong> R$ {getServicoSelecionado()?.valor_base.toLocaleString()}
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