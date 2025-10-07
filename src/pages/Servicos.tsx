import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Badge,
  IconButton,
  useDisclosure,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
  useColorModeValue
} from '@chakra-ui/react';
import { AddIcon, EditIcon, ViewIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons';
import { servicoService, funcionarioService, financeiroService } from '../services/api';
import { ServicoFormModal } from '../components/modals/ServicoFormModal';
import { ServicoDetailModal } from '../components/modals/ServicoDetailModal';

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
  funcionario?: Funcionario;
  ativo: boolean;
  descricao?: string;
  created_at: string;
  // Performance calculada
  vendas_mes?: number;
  faturamento_mes?: number;
  ticket_medio?: number;
  popularidade?: number;
}

export const Servicos: React.FC = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Cores do modo escuro/claro
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const headingColor = useColorModeValue('rosa.600', 'rosa.300');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tableBg = useColorModeValue('white', 'gray.800');
  const tableHeaderColor = useColorModeValue('gray.700', 'gray.200');
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

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar serviços e funcionários em paralelo
      const [servicosData, funcionariosData] = await Promise.all([
        servicoService.getAllWithInactive(), // Buscar todos os serviços para a tabela
        funcionarioService.getAll()
      ]);
      

      // Carregar performance dos serviços
      const movimentacoes = await financeiroService.getMovimentacoes();
      
      // Calcular performance para cada serviço
      const servicosComPerformance = servicosData.map((servico: any) => {
        const vendasServico = movimentacoes.filter(
          (m: any) => m.servico?.id === servico.id && m.tipo === 'ENTRADA'
        );
        
        // Filtrar últimos 30 dias
        const hoje = new Date();
        const trintaDiasAtras = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const vendasMes = vendasServico.filter(
          (v: any) => new Date(v.data_movimentacao) >= trintaDiasAtras
        );
        
        const faturamento_mes = vendasMes.length > 0 ? vendasMes.reduce((sum: number, v: any) => sum + v.valor, 0) : 0;
        
        // Calcular popularidade (percentual em relação ao total de vendas)
        const totalVendas = movimentacoes.filter((m: any) => m.tipo === 'ENTRADA').length;
        const popularidade = totalVendas > 0 ? (vendasMes.length / totalVendas) * 100 : 0;
        
        return {
          ...servico,
          vendas_mes: vendasMes.length,
          faturamento_mes,
          popularidade
        };
      });

      setServicos(servicosComPerformance);
      setFuncionarios(funcionariosData);
      
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os serviços.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Função para forçar recarregamento dos dados
  const recarregarDados = async () => {
    await carregarDados();
  };

  const handleNovoServico = () => {
    setServicoSelecionado(null);
    onFormOpen();
  };

  const handleEditarServico = (servico: Servico) => {
    setServicoSelecionado(servico);
    onFormOpen();
  };

  const handleVerDetalhes = (servico: Servico) => {
    setServicoSelecionado(servico);
    onDetailOpen();
  };

  const handleSalvarServico = async (dadosServico: any) => {
    try {
      if (servicoSelecionado) {
        // Editar serviço existente
        await servicoService.update(servicoSelecionado.id, dadosServico);
        toast({
          title: 'Serviço atualizado',
          description: 'Serviço foi atualizado com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Criar novo serviço
        await servicoService.create(dadosServico);
        toast({
          title: 'Serviço criado',
          description: 'Novo serviço foi criado com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Fechar modal e recarregar dados
      onFormClose();
      await carregarDados();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o serviço. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleExcluirServico = async (servico: Servico) => {
    if (window.confirm(`Tem certeza que deseja desativar o serviço "${servico.nome}"?\n\nO serviço será desativado mas não será removido do sistema.`)) {
      try {
        await servicoService.deactivate(servico.id);
        toast({
          title: 'Serviço desativado',
          description: 'Serviço foi desativado com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        await carregarDados();
      } catch (error) {
        console.error('Erro ao desativar serviço:', error);
        toast({
          title: 'Erro ao desativar',
          description: 'Não foi possível desativar o serviço. Tente novamente.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleFormClose = () => {
    setServicoSelecionado(null);
    onFormClose();
  };

  const getNomeFuncionario = (funcionarioId?: string): string => {
    if (!funcionarioId) return 'Não definido';
    const funcionario = funcionarios.find(f => f.id === funcionarioId);
    return funcionario ? `${funcionario.nome} ${funcionario.sobrenome}` : 'Não encontrado';
  };

  const getPopularidadeColor = (popularidade: number): string => {
    if (popularidade >= 70) return 'green';
    if (popularidade >= 40) return 'yellow';
    return 'red';
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text color={textColor}>Carregando serviços...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={4} align="stretch">
        {/* Cabeçalho */}
        <HStack justify="space-between" align="center">
          <Heading size="lg" color={headingColor}>
            Gestão de Serviços
          </Heading>
          <HStack spacing={3}>
            <Button
              leftIcon={<RepeatIcon />}
              variant="outline"
              colorScheme="rosa"
              onClick={recarregarDados}
              isLoading={loading}
              loadingText="Atualizando..."
            >
              Atualizar
            </Button>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="rosa"
              onClick={handleNovoServico}
            >
              Novo Serviço
            </Button>
          </HStack>
        </HStack>

        {/* Cards Estatísticos - Movidos para o topo */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card bg={cardBg} shadow="sm" borderColor={borderColor} size="sm">
            <CardBody py={3}>
              <Stat>
                <StatLabel color={mutedTextColor} fontSize="xs">Total de Serviços</StatLabel>
                <StatNumber color={textColor} fontSize="xl">
                  {servicos.filter(s => s.ativo).length}
                </StatNumber>
                <StatHelpText color={mutedTextColor} fontSize="xs" mt={0}>
                  {servicos.filter(s => !s.ativo).length} inativos
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="sm" borderColor={borderColor} size="sm">
            <CardBody py={3}>
              <Stat>
                <StatLabel color={mutedTextColor} fontSize="xs">Preço Médio</StatLabel>
                <StatNumber color="green.500" fontSize="xl">
                  R$ {servicos.length > 0 
                    ? (servicos.reduce((sum, s) => sum + s.valor_base, 0) / servicos.length).toFixed(2)
                    : '0,00'}
                </StatNumber>
                <StatHelpText color={mutedTextColor} fontSize="xs" mt={0}>Baseado em todos os serviços</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="sm" borderColor={borderColor} size="sm">
            <CardBody py={3}>
              <Stat>
                <StatLabel color={mutedTextColor} fontSize="xs">Mais Vendido</StatLabel>
                <StatNumber color="blue.500" fontSize="xl">
                  {servicos.length > 0 
                    ? servicos.reduce((prev, current) => 
                        (prev.vendas_mes || 0) > (current.vendas_mes || 0) ? prev : current
                      ).nome 
                    : 'N/A'}
                </StatNumber>
                <StatHelpText color={mutedTextColor} fontSize="xs" mt={0}>
                  {servicos.length > 0 
                    ? servicos.reduce((prev, current) => 
                        (prev.vendas_mes || 0) > (current.vendas_mes || 0) ? prev : current
                      ).vendas_mes || 0
                    : 0} vendas este mês
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Cards de Serviços - Compactos */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
          {servicos.filter(s => s.ativo).map((servico) => (
            <Card key={servico.id} bg={cardBg} shadow="sm" borderWidth="1px" borderColor={borderColor} size="sm">
              <CardBody py={3} px={4}>
                <VStack spacing={2} align="stretch">
                  {/* Header do Card - Compacto */}
                  <Box>
                    <Text fontWeight="bold" fontSize="md" color={textColor} noOfLines={1} mb={1}>
                      {servico.nome}
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.500">
                      R$ {servico.valor_base.toLocaleString()}
                    </Text>
                  </Box>

                  {/* Funcionário Responsável - Compacto */}
                  <Box>
                    <Text fontSize="xs" color={mutedTextColor}>Responsável</Text>
                    <HStack spacing={1}>
                      <Avatar 
                        size="xs" 
                        name={getNomeFuncionario(servico.funcionario_responsavel_id)}
                        bg="rosa.400"
                        color="white"
                      />
                      <Text fontSize="xs" fontWeight="medium" color={textColor} noOfLines={1}>
                        {getNomeFuncionario(servico.funcionario_responsavel_id)}
                      </Text>
                    </HStack>
                  </Box>

                  {/* Performance do Mês - Compacta */}
                  <VStack spacing={1} align="stretch">
                    <Text fontSize="xs" fontWeight="bold" color={textColor}>
                      Performance do Mês
                    </Text>
                    
                    <HStack justify="space-between">
                      <Text fontSize="xs" color={mutedTextColor}>Vendas</Text>
                      <Text fontSize="xs" fontWeight="bold" color={textColor}>
                        {servico.vendas_mes || 0}
                      </Text>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontSize="xs" color={mutedTextColor}>Faturamento</Text>
                      <Text fontSize="xs" fontWeight="bold" color="green.500">
                        R$ {servico.faturamento_mes?.toLocaleString() || '0'}
                      </Text>
                    </HStack>

                    <Box>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="xs" color={mutedTextColor}>Popularidade</Text>
                        <Text fontSize="xs" fontWeight="bold" color={textColor}>
                          {servico.popularidade?.toFixed(0) || 0}%
                        </Text>
                      </HStack>
                      <Progress 
                        value={servico.popularidade || 0} 
                        size="xs" 
                        colorScheme={getPopularidadeColor(servico.popularidade || 0)}
                        bg={progressBg}
                      />
                    </Box>
                  </VStack>

                  {/* Ações - Compactas */}
                  <HStack spacing={1} justify="center">
                    <IconButton
                      aria-label="Ver detalhes"
                      icon={<ViewIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => handleVerDetalhes(servico)}
                    />
                    <IconButton
                      aria-label="Editar serviço"
                      icon={<EditIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="rosa"
                      onClick={() => handleEditarServico(servico)}
                    />
                    <IconButton
                      aria-label="Desativar serviço"
                      icon={<DeleteIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleExcluirServico(servico)}
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Tabela Detalhada */}
        <Box bg={tableBg} p={4} borderRadius="lg" shadow="sm" borderColor={borderColor}>
          <Heading size="md" mb={3} color={tableHeaderColor}>
            Lista Completa de Serviços
          </Heading>
          
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color={mutedTextColor} fontSize="xs">Serviço</Th>
                  <Th color={mutedTextColor} fontSize="xs">Preço Base</Th>
                  <Th color={mutedTextColor} fontSize="xs">Responsável</Th>
                  <Th color={mutedTextColor} fontSize="xs">Vendas (Mês)</Th>
                  <Th color={mutedTextColor} fontSize="xs">Faturamento (Mês)</Th>
                  <Th color={mutedTextColor} fontSize="xs">Status</Th>
                  <Th color={mutedTextColor} fontSize="xs">Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {servicos.map((servico) => (
                  <Tr key={servico.id}>
                    <Td py={2}>
                      <Box>
                        <Text fontWeight="medium" color={textColor} fontSize="sm">{servico.nome}</Text>
                        <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
                          {servico.descricao || 'Sem descrição'}
                        </Text>
                      </Box>
                    </Td>
                    <Td py={2}>
                      <Text fontWeight="bold" color="green.600" fontSize="sm">
                        R$ {servico.valor_base.toLocaleString()}
                      </Text>
                    </Td>
                    <Td py={2}>
                      <HStack spacing={1}>
                        <Avatar 
                          size="xs" 
                          name={getNomeFuncionario(servico.funcionario_responsavel_id)}
                          bg="rosa.400"
                          color="white"
                        />
                        <Text fontSize="xs" color={textColor} noOfLines={1}>
                          {getNomeFuncionario(servico.funcionario_responsavel_id)}
                        </Text>
                      </HStack>
                    </Td>
                    <Td py={2}>
                      <Text fontWeight="medium" color="blue.600" fontSize="sm">
                        {servico.vendas_mes || 0}
                      </Text>
                    </Td>
                    <Td py={2}>
                      <Text fontWeight="medium" color="green.600" fontSize="sm">
                        R$ {servico.faturamento_mes?.toLocaleString() || '0'}
                      </Text>
                    </Td>
                    <Td py={2}>
                      <Badge colorScheme={servico.ativo ? 'green' : 'red'} fontSize="xs">
                        {servico.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </Td>
                    <Td py={2}>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Ver detalhes"
                          icon={<ViewIcon />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleVerDetalhes(servico)}
                        />
                        <IconButton
                          aria-label="Editar serviço"
                          icon={<EditIcon />}
                          size="xs"
                          variant="ghost"
                          colorScheme="rosa"
                          onClick={() => handleEditarServico(servico)}
                        />
                        {servico.ativo && (
                          <IconButton
                            aria-label="Desativar serviço"
                            icon={<DeleteIcon />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleExcluirServico(servico)}
                          />
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </VStack>

      {/* Modais */}
      <ServicoFormModal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleSalvarServico}
        servico={servicoSelecionado}
        funcionarios={funcionarios}
      />
      
      <ServicoDetailModal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        servico={servicoSelecionado}
        funcionarios={funcionarios}
      />
    </Box>
  );
};
