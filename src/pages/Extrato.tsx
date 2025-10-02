import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Select,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Icon,
  Progress,
  Flex,
  Alert,
  AlertIcon,
  useToast
} from '@chakra-ui/react';
import { 
  FaChartLine, 
  FaMoneyBillWave, 
  FaArrowUp, 
  FaArrowDown,
  FaCalendarAlt,
  FaDownload,
  FaUser,
  FaCut
} from 'react-icons/fa';
import { financeiroService, agendamentoService, funcionarioService, servicoService } from '../services/api';
import { MovimentacaoFinanceira } from '../types';
import { pdfExportService } from '../services/pdfExport';

interface RelatorioFuncionario {
  funcionario: any;
  totalServicos: number;
  faturamento: number;
  comissao: number;
  percentualMeta: number;
}

interface ServicoPopular {
  servico: any;
  quantidade: number;
  faturamento: number;
  percentual: number;
}

export const Extrato = () => {
  const [periodo, setPeriodo] = useState('mes'); // hoje, semana, mes, trimestre, ano
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFinanceira[]>([]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const toast = useToast();

  // Cores do tema
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [movData, agendData, funcData, servData] = await Promise.all([
        financeiroService.getMovimentacoes(),
        agendamentoService.getAll(),
        funcionarioService.getAll(),
        servicoService.getAll()
      ]);

      setMovimentacoes(movData);
      setAgendamentos(agendData);
      setFuncionarios(funcData);
      setServicos(servData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular período atual
  const getDataInicio = () => {
    const hoje = new Date();
    const inicio = new Date();

    switch (periodo) {
      case 'hoje':
        inicio.setHours(0, 0, 0, 0); // Início do dia de hoje
        break;
      case 'semana':
        inicio.setDate(hoje.getDate() - 7);
        break;
      case 'mes':
        inicio.setMonth(hoje.getMonth() - 1);
        break;
      case 'trimestre':
        inicio.setMonth(hoje.getMonth() - 3);
        break;
      case 'ano':
        inicio.setFullYear(hoje.getFullYear() - 1);
        break;
      default:
        inicio.setMonth(hoje.getMonth() - 1);
    }

    return inicio;
  };

  // Filtrar dados pelo período
  const dataInicio = getDataInicio();
  const movimentacoesFiltradas = movimentacoes.filter(m => 
    new Date(m.data_movimentacao) >= dataInicio
  );
  const agendamentosFiltrados = agendamentos.filter(a => 
    new Date(a.data_agendamento) >= dataInicio && a.status === 'REALIZADO'
  );

  // Cálculos financeiros
  const totalEntradas = movimentacoesFiltradas
    .filter(m => m.tipo === 'ENTRADA')
    .reduce((sum, m) => sum + m.valor, 0);

  const totalSaidas = movimentacoesFiltradas
    .filter(m => m.tipo === 'SAIDA')
    .reduce((sum, m) => sum + m.valor, 0);

  const saldoLiquido = totalEntradas - totalSaidas;
  const margemLucro = totalEntradas > 0 ? ((saldoLiquido / totalEntradas) * 100) : 0;

  // Período anterior para comparação
  const dataInicioAnterior = new Date(dataInicio);
  switch (periodo) {
    case 'hoje':
      dataInicioAnterior.setDate(dataInicioAnterior.getDate() - 1); // Ontem
      break;
    case 'semana':
      dataInicioAnterior.setDate(dataInicioAnterior.getDate() - 7);
      break;
    case 'mes':
      dataInicioAnterior.setMonth(dataInicioAnterior.getMonth() - 1);
      break;
    case 'trimestre':
      dataInicioAnterior.setMonth(dataInicioAnterior.getMonth() - 3);
      break;
    case 'ano':
      dataInicioAnterior.setFullYear(dataInicioAnterior.getFullYear() - 1);
      break;
  }

  const movimentacoesAnteriores = movimentacoes.filter(m => {
    const data = new Date(m.data_movimentacao);
    return data >= dataInicioAnterior && data < dataInicio;
  });

  const totalEntradasAnterior = movimentacoesAnteriores
    .filter(m => m.tipo === 'ENTRADA')
    .reduce((sum, m) => sum + m.valor, 0);

  const crescimentoReceita = totalEntradasAnterior > 0 
    ? ((totalEntradas - totalEntradasAnterior) / totalEntradasAnterior * 100)
    : 0;

  // Relatório por funcionário
  const relatorioFuncionarios: RelatorioFuncionario[] = funcionarios.map(funcionario => {
    const agendamentosFuncionario = agendamentosFiltrados.filter(a => 
      a.funcionario_id === funcionario.id
    );

    const faturamento = agendamentosFuncionario.reduce((sum, a) => {
      const servico = servicos.find(s => s.id === a.servico_id);
      return sum + (servico?.valor_base || 0);
    }, 0);

    const comissao = faturamento * (funcionario.comissao_percentual / 100);
    const percentualMeta = funcionario.meta_mensal > 0 
      ? (faturamento / funcionario.meta_mensal * 100)
      : 0;

    return {
      funcionario,
      totalServicos: agendamentosFuncionario.length,
      faturamento,
      comissao,
      percentualMeta
    };
  }).sort((a, b) => b.faturamento - a.faturamento);

  // Serviços mais populares
  const servicosPopulares: ServicoPopular[] = servicos.map(servico => {
    const agendamentosServico = agendamentosFiltrados.filter(a => 
      a.servico_id === servico.id
    );

    const quantidade = agendamentosServico.length;
    const faturamento = quantidade * servico.valor_base;
    const percentual = agendamentosFiltrados.length > 0 
      ? (quantidade / agendamentosFiltrados.length * 100)
      : 0;

    return {
      servico,
      quantidade,
      faturamento,
      percentual
    };
  })
  .filter(s => s.quantidade > 0)
  .sort((a, b) => b.quantidade - a.quantidade)
  .slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPeriod = (periodo: string) => {
    switch (periodo) {
      case 'hoje': return 'Hoje';
      case 'semana': return 'Última Semana';
      case 'mes': return 'Último Mês';
      case 'trimestre': return 'Último Trimestre';
      case 'ano': return 'Último Ano';
      default: return 'Último Mês';
    }
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const dadosRelatorio = {
        periodo,
        dataInicio,
        dataFim: new Date(),
        totalEntradas,
        totalSaidas,
        saldoLiquido,
        margemLucro,
        totalServicos: agendamentosFiltrados.length,
        ticketMedio: totalEntradas / agendamentosFiltrados.length || 0,
        crescimentoReceita,
        relatorioFuncionarios,
        servicosPopulares,
        movimentacoes: movimentacoesFiltradas
      };

      await pdfExportService.exportarRelatorio(dadosRelatorio);
      
      toast({
        title: 'PDF exportado com sucesso!',
        description: 'O arquivo foi baixado para sua pasta de downloads.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o arquivo PDF.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack spacing={4}>
          <Text>Carregando relatório...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" wrap="wrap">
          <Heading size="lg" color="rosa.500">
            <Icon as={FaChartLine} mr={3} />
            Extrato Financeiro
          </Heading>
          
          <HStack spacing={3}>
            <Select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)}
              w="200px"
            >
              <option value="hoje">Hoje</option>
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Último Ano</option>
            </Select>
            
            <Button
              leftIcon={<FaDownload />}
              colorScheme="blue"
              variant="outline"
              onClick={handleExportPDF}
              isLoading={exportingPDF}
              loadingText="Exportando..."
            >
              Exportar PDF
            </Button>
          </HStack>
        </HStack>

        {/* Período selecionado */}
        <Alert status="info">
          <AlertIcon />
          <Text>
            Relatório do período: <strong>{formatPeriod(periodo)}</strong>
            {' '}({dataInicio.toLocaleDateString()} - {new Date().toLocaleDateString()})
          </Text>
        </Alert>

        {/* Cards de resumo financeiro */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="green.500">
                  <Icon as={FaMoneyBillWave} mr={2} />
                  Total de Receitas
                </StatLabel>
                <StatNumber color="green.500" fontSize="2xl">
                  {formatCurrency(totalEntradas)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={crescimentoReceita >= 0 ? 'increase' : 'decrease'} />
                  {Math.abs(crescimentoReceita).toFixed(1)}% vs período anterior
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="red.500">
                  <Icon as={FaArrowDown} mr={2} />
                  Total de Despesas
                </StatLabel>
                <StatNumber color="red.500" fontSize="2xl">
                  {formatCurrency(totalSaidas)}
                </StatNumber>
                <StatHelpText>
                  {movimentacoesFiltradas.filter(m => m.tipo === 'SAIDA').length} transações
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color={saldoLiquido >= 0 ? 'blue.500' : 'red.500'}>
                  <Icon as={FaArrowUp} mr={2} />
                  Saldo Líquido
                </StatLabel>
                <StatNumber color={saldoLiquido >= 0 ? 'blue.500' : 'red.500'} fontSize="2xl">
                  {formatCurrency(saldoLiquido)}
                </StatNumber>
                <StatHelpText>
                  Margem: {margemLucro.toFixed(1)}%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel color="purple.500">
                  <Icon as={FaCalendarAlt} mr={2} />
                  Serviços Realizados
                </StatLabel>
                <StatNumber color="purple.500" fontSize="2xl">
                  {agendamentosFiltrados.length}
                </StatNumber>
                <StatHelpText>
                  Ticket médio: {formatCurrency(totalEntradas / agendamentosFiltrados.length || 0)}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Relatório por Funcionário */}
        <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4} color="rosa.500">
              <Icon as={FaUser} mr={2} />
              Desempenho por Funcionário
            </Heading>
            
            {relatorioFuncionarios.length > 0 ? (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Funcionário</Th>
                      <Th isNumeric>Serviços</Th>
                      <Th isNumeric>Faturamento</Th>
                      <Th isNumeric>Comissão</Th>
                      <Th>Meta</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {relatorioFuncionarios.map((relatorio) => (
                      <Tr key={relatorio.funcionario.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">
                              {relatorio.funcionario.nome} {relatorio.funcionario.sobrenome}
                            </Text>
                            <Badge colorScheme="gray" size="sm">
                              {relatorio.funcionario.funcao}
                            </Badge>
                          </VStack>
                        </Td>
                        <Td isNumeric>{relatorio.totalServicos}</Td>
                        <Td isNumeric color="green.500" fontWeight="bold">
                          {formatCurrency(relatorio.faturamento)}
                        </Td>
                        <Td isNumeric color="blue.500">
                          {formatCurrency(relatorio.comissao)}
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Progress 
                              value={Math.min(relatorio.percentualMeta, 100)} 
                              colorScheme={relatorio.percentualMeta >= 100 ? 'green' : 'yellow'}
                              size="sm"
                              w="100px"
                            />
                            <Text fontSize="xs">
                              {relatorio.percentualMeta.toFixed(0)}% da meta
                            </Text>
                          </VStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Text color="gray.500">Nenhum dado encontrado para o período selecionado.</Text>
            )}
          </CardBody>
        </Card>

        {/* Serviços Mais Populares */}
        <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4} color="rosa.500">
              <Icon as={FaCut} mr={2} />
              Serviços Mais Populares
            </Heading>
            
            {servicosPopulares.length > 0 ? (
              <VStack spacing={4}>
                {servicosPopulares.map((item, index) => (
                  <Box key={item.servico.id} w="full">
                    <Flex justify="space-between" align="center" mb={2}>
                      <HStack>
                        <Badge colorScheme="rosa" fontSize="sm">
                          #{index + 1}
                        </Badge>
                        <Text fontWeight="bold">{item.servico.nome}</Text>
                      </HStack>
                      <HStack spacing={4}>
                        <Text fontSize="sm" color="gray.600">
                          {item.quantidade} vezes
                        </Text>
                        <Text fontWeight="bold" color="green.500">
                          {formatCurrency(item.faturamento)}
                        </Text>
                      </HStack>
                    </Flex>
                    <Progress 
                      value={item.percentual} 
                      colorScheme="rosa" 
                      size="sm"
                      bg="gray.200"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {item.percentual.toFixed(1)}% do total de serviços
                    </Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500">Nenhum serviço encontrado para o período selecionado.</Text>
            )}
          </CardBody>
        </Card>

        {/* Últimas Movimentações */}
        <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4} color="rosa.500">
              Últimas Movimentações
            </Heading>
            
            {movimentacoesFiltradas.length > 0 ? (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Data</Th>
                      <Th>Tipo</Th>
                      <Th>Método</Th>
                      <Th>Descrição</Th>
                      <Th isNumeric>Valor</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {movimentacoesFiltradas
                      .sort((a, b) => new Date(b.data_movimentacao).getTime() - new Date(a.data_movimentacao).getTime())
                      .slice(0, 10)
                      .map((movimentacao) => (
                        <Tr key={movimentacao.id}>
                          <Td>{new Date(movimentacao.data_movimentacao).toLocaleDateString()}</Td>
                          <Td>
                            <Badge 
                              colorScheme={movimentacao.tipo === 'ENTRADA' ? 'green' : 'red'}
                              size="sm"
                            >
                              {movimentacao.tipo}
                            </Badge>
                          </Td>
                          <Td>{movimentacao.metodo_pagamento || 'N/A'}</Td>
                          <Td>{movimentacao.descricao}</Td>
                          <Td isNumeric>
                            <Text 
                              color={movimentacao.tipo === 'ENTRADA' ? 'green.500' : 'red.500'}
                              fontWeight="bold"
                            >
                              {movimentacao.tipo === 'ENTRADA' ? '+' : '-'}
                              {formatCurrency(movimentacao.valor)}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Text color="gray.500">Nenhuma movimentação encontrada para o período selecionado.</Text>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};