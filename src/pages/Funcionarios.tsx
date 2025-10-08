import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  IconButton,
  useDisclosure,
  HStack,
  VStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Card,
  CardBody,
  Avatar,
  Progress,
  useToast,
  useColorModeValue,
  useBreakpointValue,
  Divider
} from '@chakra-ui/react';
import { AddIcon, EditIcon, ViewIcon, RepeatIcon } from '@chakra-ui/icons';
import { funcionarioService } from '../services/api';
import { FuncionarioFormModal } from '../components/modals/FuncionarioFormModal';
import { FuncionarioDetailModal } from '../components/modals/FuncionarioDetailModal';

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
  created_at: string;
  // Performance calculada
  faturamento_total?: number;
  servicos_realizados?: number;
  ticket_medio?: number;
}

export const Funcionarios: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<Funcionario | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Responsividade
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Cores do modo escuro/claro
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const headingColor = useColorModeValue('rosa.600', 'rosa.300');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tableHeaderColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.800');
  const progressBg = useColorModeValue('gray.100', 'gray.700');

  const { 
    isOpen: isFormOpen, 
    onOpen: onFormOpen, 
    onClose: onFormClose 
  } = useDisclosure();

  const { 
    isOpen: isDetailOpen, 
    onOpen: onDetailOpen, 
    onClose: onDetailClose 
  } = useDisclosure();

  const carregarFuncionarios = async () => {
    try {
      setLoading(true);
      const dados = await funcionarioService.getAllWithPerformance();
      setFuncionarios(dados);
    } catch (error) {
      console.error('❌ Erro ao carregar funcionários:', error);
      toast({
        title: 'Erro ao carregar funcionários',
        description: 'Não foi possível carregar a lista de funcionários.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const handleNovoFuncionario = () => {
    setFuncionarioSelecionado(null);
    onFormOpen();
  };

  const handleEditarFuncionario = (funcionario: Funcionario) => {
    setFuncionarioSelecionado(funcionario);
    onFormOpen();
  };

  const handleVerDetalhes = (funcionario: Funcionario) => {
    setFuncionarioSelecionado(funcionario);
    onDetailOpen();
  };

  const handleSalvarFuncionario = async (dadosFuncionario: any) => {
    try {
      if (funcionarioSelecionado) {
        await funcionarioService.update(funcionarioSelecionado.id, dadosFuncionario);
        toast({
          title: 'Funcionário atualizado',
          description: 'Os dados do funcionário foram atualizados com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await funcionarioService.create(dadosFuncionario);
        toast({
          title: 'Funcionário cadastrado',
          description: 'Novo funcionário foi cadastrado com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      await carregarFuncionarios();
      onFormClose();
    } catch (error) {
      console.error('❌ Erro ao salvar funcionário:', error);
      toast({
        title: 'Erro ao salvar funcionário',
        description: 'Não foi possível salvar os dados do funcionário.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const calcularProgressoMeta = (funcionario: Funcionario) => {
    if (!funcionario.meta_mensal || !funcionario.faturamento_total) return 0;
    return Math.min((funcionario.faturamento_total / funcionario.meta_mensal) * 100, 100);
  };

  const getFuncaoColor = (funcao: string) => {
    const cores: { [key: string]: string } = {
      'Cabeleireira': 'purple',
      'Manicure': 'pink',
      'Esteticista': 'blue',
      'Massagista': 'green',
      'Recepcionista': 'orange',
    };
    return cores[funcao] || 'gray';
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text>Carregando funcionários...</Text>
      </Box>
    );
  }

  return (
    <Box p={6} bg={bgColor} color={textColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Cabeçalho */}
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Heading size={{ base: 'md', md: 'lg' }} color={headingColor}>
            Gestão de Funcionários
          </Heading>
          <HStack spacing={{ base: 2, md: 3 }} flexWrap="wrap">
            <Button
              leftIcon={<RepeatIcon />}
              variant="outline"
              colorScheme="gray"
              onClick={carregarFuncionarios}
              isLoading={loading}
              loadingText="Atualizando..."
              size={{ base: 'sm', md: 'md' }}
            >
              <Text display={{ base: 'none', md: 'block' }}>Atualizar</Text>
            </Button>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="rosa"
              onClick={handleNovoFuncionario}
              size={{ base: 'sm', md: 'md' }}
            >
              <Text display={{ base: 'none', md: 'block' }}>Novo Funcionário</Text>
              <Text display={{ base: 'block', md: 'none' }}>Novo</Text>
            </Button>
          </HStack>
        </HStack>

        {/* Cards de Performance */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 3, md: 4 }}>
          {funcionarios.filter(f => f.ativo).map((funcionario) => (
            <Card key={funcionario.id} bg={cardBg} shadow="sm" borderWidth="1px" borderColor={borderColor}>
              <CardBody p={{ base: 4, md: 6 }}>
                <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                  <HStack spacing={{ base: 2, md: 3 }}>
                    <Avatar 
                      size={{ base: 'sm', md: 'md' }} 
                      name={`${funcionario.nome} ${funcionario.sobrenome}`}
                      bg="rosa.400"
                      color="white"
                    />
                    <Box flex="1" minW={0}>
                      <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }} noOfLines={1}>
                        {funcionario.nome} {funcionario.sobrenome}
                      </Text>
                      <Badge 
                        size="sm" 
                        colorScheme={getFuncaoColor(funcionario.funcao)}
                      >
                        {funcionario.funcao}
                      </Badge>
                    </Box>
                  </HStack>

                  <Box>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="xs" color={mutedTextColor}>Meta Mensal</Text>
                      <Text fontSize="xs" fontWeight="bold">
                        {calcularProgressoMeta(funcionario).toFixed(0)}%
                      </Text>
                    </HStack>
                    <Progress 
                      value={calcularProgressoMeta(funcionario)} 
                      size="sm" 
                      colorScheme="rosa"
                      bg={progressBg}
                    />
                  </Box>

                  <SimpleGrid columns={2} spacing={{ base: 1, md: 2 }}>
                    <Stat size="sm">
                      <StatLabel fontSize="xs">Faturamento</StatLabel>
                      <StatNumber fontSize={{ base: 'xs', md: 'sm' }} color="green.500">
                        R$ {funcionario.faturamento_total?.toLocaleString() || '0'}
                      </StatNumber>
                    </Stat>
                    <Stat size="sm">
                      <StatLabel fontSize="xs">Serviços</StatLabel>
                      <StatNumber fontSize="sm">
                        {funcionario.servicos_realizados || 0}
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>

                  <HStack spacing={1}>
                    <IconButton
                      aria-label="Ver detalhes"
                      icon={<ViewIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => handleVerDetalhes(funcionario)}
                    />
                    <IconButton
                      aria-label="Editar funcionário"
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="rosa"
                      onClick={() => handleEditarFuncionario(funcionario)}
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Lista de Funcionários - Responsiva */}
        <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" shadow="sm" borderWidth="1px" borderColor={borderColor}>
          <Heading size={{ base: 'sm', md: 'md' }} mb={4} color={tableHeaderColor}>
            Lista Completa de Funcionários
          </Heading>
          
          {isMobile ? (
            // Layout Mobile - Cards
            <VStack spacing={3} align="stretch">
              {funcionarios.map((funcionario) => (
                <Card key={funcionario.id} size="sm" variant="outline">
                  <CardBody p={4}>
                    <VStack align="stretch" spacing={3}>
                      {/* Header do funcionário */}
                      <HStack justify="space-between" align="center">
                        <HStack spacing={3}>
                          <Avatar 
                            size="md" 
                            name={`${funcionario.nome} ${funcionario.sobrenome}`}
                            bg="rosa.400"
                            color="white"
                          />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" fontSize="md">
                              {funcionario.nome} {funcionario.sobrenome}
                            </Text>
                            <Badge colorScheme={getFuncaoColor(funcionario.funcao)}>
                              {funcionario.funcao}
                            </Badge>
                          </VStack>
                        </HStack>
                        <Badge colorScheme={funcionario.ativo ? 'green' : 'red'} variant="solid">
                          {funcionario.ativo ? 'ATIVO' : 'INATIVO'}
                        </Badge>
                      </HStack>
                      
                      {/* Informações de contato */}
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Telefone:</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {funcionario.telefone}
                          </Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">Email:</Text>
                          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                            {funcionario.email}
                          </Text>
                        </HStack>
                        
                        {funcionario.meta_mensal && (
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">Meta mensal:</Text>
                            <Text fontSize="sm" fontWeight="bold" color="green.600">
                              R$ {funcionario.meta_mensal.toLocaleString()}
                            </Text>
                          </HStack>
                        )}
                        
                        {funcionario.comissao_percentual && (
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">Comissão:</Text>
                            <Text fontSize="sm" fontWeight="bold" color="blue.600">
                              {funcionario.comissao_percentual}%
                            </Text>
                          </HStack>
                        )}
                        
                        {funcionario.faturamento_total && (
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">Faturamento:</Text>
                            <Text fontSize="sm" fontWeight="bold" color="green.500">
                              R$ {funcionario.faturamento_total.toLocaleString()}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                      
                      {/* Progresso da meta */}
                      {funcionario.meta_mensal && funcionario.faturamento_total && (
                        <VStack align="stretch" spacing={1}>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">Progresso da meta:</Text>
                            <Text fontSize="sm" fontWeight="bold">
                              {calcularProgressoMeta(funcionario).toFixed(0)}%
                            </Text>
                          </HStack>
                          <Progress 
                            value={calcularProgressoMeta(funcionario)} 
                            size="md" 
                            colorScheme="rosa"
                            bg={progressBg}
                            borderRadius="full"
                          />
                        </VStack>
                      )}
                      
                      <Divider />
                      
                      {/* Ações */}
                      <HStack justify="center" spacing={3}>
                        <IconButton
                          aria-label="Ver detalhes"
                          icon={<ViewIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleVerDetalhes(funcionario)}
                        />
                        <IconButton
                          aria-label="Editar funcionário"
                          icon={<EditIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="rosa"
                          onClick={() => handleEditarFuncionario(funcionario)}
                        />
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          ) : (
            // Layout Desktop - Tabela
            <TableContainer>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>Nome</Th>
                    <Th>Função</Th>
                    <Th>Telefone</Th>
                    <Th>Email</Th>
                    <Th>Status</Th>
                    <Th>Meta Mensal</Th>
                    <Th>Comissão</Th>
                    <Th>Faturamento</Th>
                    <Th>Meta (%)</Th>
                    <Th>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {funcionarios.map((funcionario) => (
                    <Tr key={funcionario.id}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar 
                            size="sm" 
                            name={`${funcionario.nome} ${funcionario.sobrenome}`}
                            bg="rosa.400"
                            color="white"
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                              {funcionario.nome} {funcionario.sobrenome}
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={getFuncaoColor(funcionario.funcao)}>
                          {funcionario.funcao}
                        </Badge>
                      </Td>
                      <Td>{funcionario.telefone}</Td>
                      <Td color={mutedTextColor}>{funcionario.email}</Td>
                      <Td>
                        <Badge colorScheme={funcionario.ativo ? 'green' : 'red'}>
                          {funcionario.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </Td>
                      <Td>
                        {funcionario.meta_mensal ? (
                          <Text color="green.600" fontWeight="medium" fontSize="sm">
                            R$ {funcionario.meta_mensal.toLocaleString()}
                          </Text>
                        ) : (
                          <Text color={mutedTextColor}>Não definida</Text>
                        )}
                      </Td>
                      <Td>
                        {funcionario.comissao_percentual ? (
                          <Text color="blue.600" fontWeight="medium" fontSize="sm">
                            {funcionario.comissao_percentual}%
                          </Text>
                        ) : (
                          <Text color={mutedTextColor}>Não definida</Text>
                        )}
                      </Td>
                      <Td>
                        <Text color="green.500" fontWeight="medium" fontSize="sm">
                          R$ {funcionario.faturamento_total?.toLocaleString() || '0'}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="stretch" spacing={1}>
                          <Text fontSize="xs" fontWeight="bold" textAlign="center">
                            {calcularProgressoMeta(funcionario).toFixed(0)}%
                          </Text>
                          <Progress 
                            value={calcularProgressoMeta(funcionario)} 
                            size="xs" 
                            colorScheme="rosa"
                            bg={progressBg}
                            w="60px"
                          />
                        </VStack>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Ver detalhes"
                            icon={<ViewIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleVerDetalhes(funcionario)}
                          />
                          <IconButton
                            aria-label="Editar funcionário"
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="rosa"
                            onClick={() => handleEditarFuncionario(funcionario)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </VStack>

      {/* Modais */}
      <FuncionarioFormModal
        isOpen={isFormOpen}
        onClose={onFormClose}
        funcionario={funcionarioSelecionado}
        onSave={handleSalvarFuncionario}
      />

      <FuncionarioDetailModal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        funcionario={funcionarioSelecionado}
      />
    </Box>
  );
};
