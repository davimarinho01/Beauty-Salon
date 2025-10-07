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
  telefone: string;
  email: string;
  funcao: string;
  ativo: boolean;
  meta_semanal?: number;
  meta_mensal?: number;
  comissao_percentual?: number;
}

interface FuncionarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionario?: Funcionario | null;
  onSave: (dados: any) => Promise<void>;
}

export const FuncionarioFormModal: React.FC<FuncionarioFormModalProps> = ({
  isOpen,
  onClose,
  funcionario,
  onSave
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    telefone: '',
    email: '',
    funcao: '',
    ativo: true,
    meta_semanal: 0,
    meta_mensal: 0,
    comissao_percentual: 0
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const funcoes = [
    'Cabeleireira',
    'Manicure',
    'Esteticista',
    'Massagista',
    'Recepcionista',
    'Gerente',
    'Proprietária'
  ];

  useEffect(() => {
    if (funcionario) {
      setFormData({
        nome: funcionario.nome || '',
        sobrenome: funcionario.sobrenome || '',
        telefone: funcionario.telefone || '',
        email: funcionario.email || '',
        funcao: funcionario.funcao || '',
        ativo: funcionario.ativo ?? true,
        meta_semanal: funcionario.meta_semanal || 0,
        meta_mensal: funcionario.meta_mensal || 0,
        comissao_percentual: funcionario.comissao_percentual || 0
      });
    } else {
      setFormData({
        nome: '',
        sobrenome: '',
        telefone: '',
        email: '',
        funcao: '',
        ativo: true,
        meta_semanal: 0,
        meta_mensal: 0,
        comissao_percentual: 0
      });
    }
  }, [funcionario, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.nome.trim() || !formData.sobrenome.trim() || !formData.email.trim() || !formData.funcao) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, insira um email válido.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
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
          {funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              {/* Dados Pessoais */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Nome</FormLabel>
                    <Input
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Digite o nome"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Sobrenome</FormLabel>
                    <Input
                      value={formData.sobrenome}
                      onChange={(e) => handleInputChange('sobrenome', e.target.value)}
                      placeholder="Digite o sobrenome"
                    />
                  </FormControl>
                </GridItem>
              </Grid>

              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Telefone</FormLabel>
                    <Input
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </FormControl>
                </GridItem>
              </Grid>

              {/* Função e Status */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Função</FormLabel>
                    <Select
                      value={formData.funcao}
                      onChange={(e) => handleInputChange('funcao', e.target.value)}
                      placeholder="Selecione a função"
                    >
                      {funcoes.map((funcao) => (
                        <option key={funcao} value={funcao}>
                          {funcao}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl display="flex" alignItems="center" h="full">
                    <FormLabel mb="0">Funcionário Ativo</FormLabel>
                    <Switch
                      isChecked={formData.ativo}
                      onChange={(e) => handleInputChange('ativo', e.target.checked)}
                      colorScheme="rosa"
                    />
                  </FormControl>
                </GridItem>
              </Grid>

              <Divider />
              <Text fontWeight="bold" color="gray.700" alignSelf="flex-start">
                Metas e Comissões
              </Text>

              {/* Metas */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <GridItem>
                  <FormControl>
                    <FormLabel>Meta Semanal (R$)</FormLabel>
                    <NumberInput
                      value={formData.meta_semanal}
                      onChange={(_, value) => handleInputChange('meta_semanal', value || 0)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0,00" />
                    </NumberInput>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Meta Mensal (R$)</FormLabel>
                    <NumberInput
                      value={formData.meta_mensal}
                      onChange={(_, value) => handleInputChange('meta_mensal', value || 0)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField placeholder="0,00" />
                    </NumberInput>
                  </FormControl>
                </GridItem>
              </Grid>

              {/* Comissão */}
              <FormControl>
                <FormLabel>Percentual de Comissão (%)</FormLabel>
                <NumberInput
                  value={formData.comissao_percentual}
                  onChange={(_, value) => handleInputChange('comissao_percentual', value || 0)}
                  min={0}
                  max={100}
                  precision={2}
                >
                  <NumberInputField placeholder="0,00" />
                </NumberInput>
              </FormControl>
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
                {funcionario ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
