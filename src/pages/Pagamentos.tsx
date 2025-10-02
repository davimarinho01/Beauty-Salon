import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
  Select,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Progress
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  FaCreditCard,
  FaDollarSign,
  FaChartBar,
  FaChartLine,
  FaPercent
} from 'react-icons/fa';
import { supabase } from '../services/supabase';

interface MetodoAnalise {
  metodo: string;
  total: number;
  quantidade: number;
  percentual: number;
  cor: string;
}

interface DadosGrafico {
  periodo: string;
  dinheiro: number;
  cartao_credito: number;
  cartao_debito: number;
  pix: number;
  transferencia: number;
}

export const Pagamentos = () => {
  const [dados, setDados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes'); // hoje, semana, mes, trimestre, ano
  const [metodosAnalise, setMetodosAnalise] = useState<MetodoAnalise[]>([]);
  const [dadosGraficoLinhas, setDadosGraficoLinhas] = useState<DadosGrafico[]>([]);

  // Cores do tema
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Cores para os métodos de pagamento
  const coresMetodos = {
    dinheiro: '#48BB78',
    cartao_credito: '#4299E1',
    cartao_debito: '#9F7AEA',
    pix: '#ED8936',
    transferencia: '#38B2AC'
  };

  useEffect(() => {
    carregarDados();
  }, [periodo]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Definir período
      const dataInicio = getDataInicio();
      
      // Carregar movimentações financeiras do período
      const { data: todasMovimentacoes, error } = await supabase
        .from('movimentacoes_financeiras')
        .select('*')
        .order('data_movimentacao', { ascending: true });

      if (error) {
        console.error('Erro ao carregar dados:', error);
        throw error;
      }

      // Filtrar apenas entradas do período
      const movimentacoes = todasMovimentacoes?.filter(mov => {
        const dataMovimentacao = new Date(mov.data_movimentacao);
        const isEntrada = mov.tipo?.toLowerCase() === 'entrada';
        const noPeriodo = dataMovimentacao >= dataInicio;
        
        return isEntrada && noPeriodo;
      }) || [];

      console.log(`Encontradas ${movimentacoes.length} entradas no período`);

      setDados(movimentacoes);
      processarAnalises(movimentacoes);
      processarGraficoLinhas(movimentacoes);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDataInicio = () => {
    const hoje = new Date();
    const inicio = new Date();

    switch (periodo) {
      case 'hoje':
        inicio.setHours(0, 0, 0, 0);
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

  const processarAnalises = (movimentacoes: any[]) => {
    // Mapeamento de métodos do banco para os nomes esperados
    const mapearMetodo = (metodo: string) => {
      const mapeamento = {
        'DINHEIRO': 'dinheiro',
        'PIX': 'pix', 
        'CREDITO': 'cartao_credito',
        'DEBITO': 'cartao_debito',
        'TRANSFERENCIA': 'transferencia',
        // Fallbacks para minúsculas também
        'dinheiro': 'dinheiro',
        'pix': 'pix',
        'cartao_credito': 'cartao_credito',
        'cartao_debito': 'cartao_debito',
        'transferencia': 'transferencia'
      };
      return mapeamento[metodo?.toUpperCase() as keyof typeof mapeamento] || 'dinheiro';
    };
    
    const analises: { [key: string]: { total: number; quantidade: number } } = {};

    // Agrupar por método
    movimentacoes.forEach(mov => {
      const metodoOriginal = mov.metodo_pagamento || 'DINHEIRO';
      const metodo = mapearMetodo(metodoOriginal);
      const valor = Number(mov.valor) || 0;
      
      if (!analises[metodo]) {
        analises[metodo] = { total: 0, quantidade: 0 };
      }
      analises[metodo].total += valor;
      analises[metodo].quantidade += 1;
    });

    // Calcular total geral
    const totalGeral = Object.values(analises).reduce((sum, item) => sum + item.total, 0);

    // Converter para array com percentuais
    const metodosArray = Object.entries(analises).map(([metodo, dados]) => ({
      metodo,
      total: dados.total,
      quantidade: dados.quantidade,
      percentual: totalGeral > 0 ? (dados.total / totalGeral) * 100 : 0,
      cor: coresMetodos[metodo as keyof typeof coresMetodos] || '#CBD5E0'
    }));

    // Ordenar por total decrescente
    metodosArray.sort((a, b) => b.total - a.total);
    
    setMetodosAnalise(metodosArray);
  };

  const processarGraficoLinhas = (movimentacoes: any[]) => {
    // Mapeamento de métodos do banco para os nomes esperados
    const mapearMetodo = (metodo: string) => {
      const mapeamento = {
        'DINHEIRO': 'dinheiro',
        'PIX': 'pix',
        'CREDITO': 'cartao_credito',
        'DEBITO': 'cartao_debito',
        'TRANSFERENCIA': 'transferencia',
        // Fallbacks para minúsculas também
        'dinheiro': 'dinheiro',
        'pix': 'pix',
        'cartao_credito': 'cartao_credito',
        'cartao_debito': 'cartao_debito',
        'transferencia': 'transferencia'
      };
      return mapeamento[metodo?.toUpperCase() as keyof typeof mapeamento] || 'dinheiro';
    };
    
    // Agrupar por data
    const dadosPorData: { [key: string]: any } = {};

    movimentacoes.forEach(mov => {
      const data = new Date(mov.data_movimentacao).toLocaleDateString('pt-BR');
      const metodoOriginal = mov.metodo_pagamento || 'DINHEIRO';
      const metodo = mapearMetodo(metodoOriginal);
      const valor = Number(mov.valor) || 0;
      
      if (!dadosPorData[data]) {
        dadosPorData[data] = {
          periodo: data,
          dinheiro: 0,
          cartao_credito: 0,
          cartao_debito: 0,
          pix: 0,
          transferencia: 0
        };
      }
      
      dadosPorData[data][metodo] += valor;
    });

    // Converter para array e ordenar por data
    const dadosArray = Object.values(dadosPorData).sort((a: any, b: any) => {
      const dataA = new Date(a.periodo.split('/').reverse().join('-')).getTime();
      const dataB = new Date(b.periodo.split('/').reverse().join('-')).getTime();
      return dataA - dataB;
    });

    setDadosGraficoLinhas(dadosArray);
  };

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Formatação de método
  const formatMetodo = (metodo: string) => {
    const nomes = {
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      pix: 'PIX',
      transferencia: 'Transferência'
    };
    return nomes[metodo as keyof typeof nomes] || metodo;
  };

  // Ícone do método
  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case 'dinheiro': return FaDollarSign;
      case 'cartao_credito':
      case 'cartao_debito':
      case 'transferencia': return FaCreditCard;
      case 'pix': return FaDollarSign;
      default: return FaDollarSign;
    }
  };

  const totalGeral = metodosAnalise.reduce((sum, item) => sum + item.total, 0);
  const quantidadeTotal = metodosAnalise.reduce((sum, item) => sum + item.quantidade, 0);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="pink.500" />
      </Flex>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Cabeçalho */}
        <HStack justify="space-between" align="center">
          <Heading size="lg" color="pink.500">
            <Icon as={FaChartBar} mr={3} />
            Análise de Métodos de Pagamento
          </Heading>
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
        </HStack>

        {/* Estatísticas Gerais */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel color={textColor}>Total de Entradas</StatLabel>
                <StatNumber color="green.500" fontSize="2xl">
                  {formatCurrency(totalGeral)}
                </StatNumber>
                <StatHelpText>
                  {quantidadeTotal} transações
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel color={textColor}>Método Mais Usado</StatLabel>
                <StatNumber color="blue.500" fontSize="xl">
                  {metodosAnalise[0] ? formatMetodo(metodosAnalise[0].metodo) : 'N/A'}
                </StatNumber>
                <StatHelpText>
                  {metodosAnalise[0] ? `${metodosAnalise[0].percentual.toFixed(1)}% do total` : ''}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel color={textColor}>Ticket Médio</StatLabel>
                <StatNumber color="purple.500" fontSize="2xl">
                  {quantidadeTotal > 0 ? formatCurrency(totalGeral / quantidadeTotal) : formatCurrency(0)}
                </StatNumber>
                <StatHelpText>
                  Valor médio por transação
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Gráfico de Barras - Valores por Método */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Heading size="md" mb={4} color={textColor}>
              <Icon as={FaChartBar} mr={2} />
              Comparação de Valores por Método
            </Heading>
            <Box h="400px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metodosAnalise}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="metodo" 
                    tickFormatter={formatMetodo}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$')} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Valor']}
                    labelFormatter={(label) => formatMetodo(label)}
                  />
                  <Bar dataKey="total" fill="#E8B4CB" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Gráfico de Linhas - Evolução Temporal */}
        {dadosGraficoLinhas.length > 0 && (
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Heading size="md" mb={4} color={textColor}>
                <Icon as={FaChartLine} mr={2} />
                Evolução Temporal dos Métodos
                <Text fontSize="sm" color={textColor} mt={1}>
                  {dadosGraficoLinhas.length} dia{dadosGraficoLinhas.length !== 1 ? 's' : ''} com dados
                </Text>
              </Heading>
              <Box h="400px">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosGraficoLinhas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$')} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="dinheiro" stroke={coresMetodos.dinheiro} name="Dinheiro" />
                    <Line type="monotone" dataKey="cartao_credito" stroke={coresMetodos.cartao_credito} name="Cartão Crédito" />
                    <Line type="monotone" dataKey="cartao_debito" stroke={coresMetodos.cartao_debito} name="Cartão Débito" />
                    <Line type="monotone" dataKey="pix" stroke={coresMetodos.pix} name="PIX" />
                    <Line type="monotone" dataKey="transferencia" stroke={coresMetodos.transferencia} name="Transferência" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        )}

        {/* Ranking Detalhado */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Heading size="md" mb={4} color={textColor}>
              <Icon as={FaPercent} mr={2} />
              Ranking dos Métodos de Pagamento
            </Heading>
            {dados.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text>Nenhum dado encontrado para o período selecionado.</Text>
                  <Text fontSize="sm" color={textColor}>
                    Verifique se existem movimentações financeiras cadastradas com tipo "entrada".
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Período atual: {periodo} | Total de dados carregados: {dados.length}
                  </Text>
                </VStack>
              </Alert>
            ) : metodosAnalise.length === 0 ? (
              <Alert status="warning">
                <AlertIcon />
                <Text>Dados carregados mas nenhum método de pagamento encontrado.</Text>
              </Alert>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Posição</Th>
                      <Th>Método</Th>
                      <Th>Valor Total</Th>
                      <Th>Quantidade</Th>
                      <Th>Percentual</Th>
                      <Th>Participação</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {metodosAnalise.map((metodo, index) => (
                      <Tr key={metodo.metodo}>
                        <Td>
                          <Badge 
                            colorScheme={index === 0 ? 'yellow' : index === 1 ? 'gray' : 'orange'}
                            fontSize="sm"
                          >
                            #{index + 1}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack>
                            <Icon as={getMetodoIcon(metodo.metodo)} color={metodo.cor} />
                            <Text fontWeight="bold">{formatMetodo(metodo.metodo)}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontWeight="bold" color="green.500">
                            {formatCurrency(metodo.total)}
                          </Text>
                        </Td>
                        <Td>
                          <Text>{metodo.quantidade} transações</Text>
                        </Td>
                        <Td>
                          <Text fontWeight="bold">
                            {metodo.percentual.toFixed(1)}%
                          </Text>
                        </Td>
                        <Td>
                          <Box w="100px">
                            <Progress 
                              value={metodo.percentual} 
                              colorScheme="pink" 
                              size="lg"
                              bg="gray.200"
                            />
                          </Box>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};