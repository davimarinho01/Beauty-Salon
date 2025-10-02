import React, { useState, useEffect } from 'react';
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
  NumberInput,
  NumberInputField,
  Switch,
  Select,
  Textarea,
  useToast,
  Grid,
  GridItem,
  Text,
  Divider
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
  funcionario_responsavel_id?: string;
  ativo: boolean;
  descricao?: string;
}

interface ServicoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  servico?: Servico | null;
  funcionarios: Funcionario[];
  onSave: (dados: any) => Promise<void>;
}

export const ServicoFormModal: React.FC<ServicoFormModalProps> = ({
  isOpen,
  onClose,
  servico,
  funcionarios,
  onSave
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    valor_base: 0,
    funcionario_responsavel_id: '',
    ativo: true,
    descricao: ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (servico) {
      setFormData({
        nome: servico.nome || '',
        valor_base: servico.valor_base || 0,
        funcionario_responsavel_id: servico.funcionario_responsavel_id || '',
        ativo: servico.ativo ?? true,
        descricao: servico.descricao || ''
      });
    } else {
      setFormData({
        nome: '',
        valor_base: 0,
        funcionario_responsavel_id: '',
        ativo: true,
        descricao: ''
      });
    }
  }, [servico, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.nome.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do serviço.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.valor_base <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'O valor do serviço deve ser maior que zero.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      
      // Preparar dados para envio
      const dadosServico = {
        ...formData,
        funcionario_responsavel_id: formData.funcionario_responsavel_id || null
      };
      
      await onSave(dadosServico);
      
      // Resetar formulário após sucesso
      setFormData({
        nome: '',
        valor_base: 0,
        funcionario_responsavel_id: '',
        ativo: true,
        descricao: ''
      });
      
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o serviço. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="rosa.600">
          {servico ? 'Editar Serviço' : 'Novo Serviço'}
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              {/* Nome do Serviço */}
              <FormControl isRequired>
                <FormLabel>Nome do Serviço</FormLabel>
                <Input
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Ex: Corte e Escova"
                />
              </FormControl>

              {/* Preço e Status */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Preço Base (R$)</FormLabel>
                    <NumberInput
                      value={formData.valor_base}
                      onChange={(_, value) => handleInputChange('valor_base', value || 0)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0,00" />
                    </NumberInput>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl display="flex" alignItems="center" h="full">
                    <FormLabel mb="0">Serviço Ativo</FormLabel>
                    <Switch
                      isChecked={formData.ativo}
                      onChange={(e) => handleInputChange('ativo', e.target.checked)}
                      colorScheme="rosa"
                    />
                  </FormControl>
                </GridItem>
              </Grid>

              {/* Funcionário Responsável */}
              <FormControl>
                <FormLabel>Funcionário Responsável</FormLabel>
                <Select
                  value={formData.funcionario_responsavel_id}
                  onChange={(e) => handleInputChange('funcionario_responsavel_id', e.target.value)}
                  placeholder="Selecione um funcionário (opcional)"
                >
                  {funcionarios.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome} {funcionario.sobrenome} - {funcionario.funcao}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              {/* Descrição */}
              <FormControl>
                <FormLabel>Descrição do Serviço</FormLabel>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descreva o serviço, tempo de duração, materiais inclusos, etc."
                  rows={4}
                />
              </FormControl>

              {/* Informações Adicionais */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <GridItem>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Dica:</strong> O funcionário responsável receberá as comissões deste serviço.
                  </Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Preço:</strong> Você poderá ajustar o preço durante o atendimento se necessário.
                  </Text>
                </GridItem>
              </Grid>
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
                loadingText="Salvando..."
              >
                {servico ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};