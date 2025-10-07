import { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  VStack,
  HStack,
  Heading,
  Select,
  Button,
  useToast,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Download,
  BarChart3
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { pdfExportService } from '../services/pdfExport';
import { financeiroService } from '../services/api';

export const Dashboard = () => {
  const [exportingPDF, setExportingPDF] = useState(false);
  const [periodo, setPeriodo] = useState('30');
  const [carregando, setCarregando] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dadosDashboard, setDadosDashboard] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [statsCards, setStatsCards] = useState<any[]>([]);
  const toast = useToast();

  // Cores do modo escuro/claro
  const headingColor = useColorModeValue('neutral.800', 'gray.100');
  const textColor = useColorModeValue('neutral.600', 'gray.400');
  const borderColor = useColorModeValue('neutral.200', 'gray.600');
  const selectBg = useColorModeValue('white', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');

  // Opções de período
  const periodos = [
    { value: '7', label: 'Últimos 7 dias' },
    { value: '30', label: 'Últimos 30 dias' },
    { value: '90', label: 'Últimos 90 dias' }
  ];

  // Função para obter o nome do dia da semana
  const obterDiaDaSemana = (data: Date) => {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return diasSemana[data.getDay()];
  };
  const cardBorderColor = useColorModeValue('neutral.100', 'gray.600');
  const statLabelColor = useColorModeValue('neutral.600', 'gray.400');
  const statNumberColor = useColorModeValue('neutral.800', 'gray.100');

  const carregarDadosDashboard = async () => {
    try {
      setCarregando(true);
      setLoading(true);
      
      // Calcular período
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999); // Fim do dia atual
      let dataInicio = new Date();
      
      switch (periodo) {
        case '7':
          dataInicio.setDate(hoje.getDate() - 7);
          dataInicio.setHours(0, 0, 0, 0); // Início do dia
          break;
        case '30':
          dataInicio.setDate(hoje.getDate() - 30);
          dataInicio.setHours(0, 0, 0, 0); // Início do dia
          break;
        case '90':
          dataInicio.setDate(hoje.getDate() - 90);
          dataInicio.setHours(0, 0, 0, 0); // Início do dia
          break;
        default:
          dataInicio.setDate(hoje.getDate() - 7);
          dataInicio.setHours(0, 0, 0, 0); // Início do dia
      }

      // Carregar movimentações

      const movimentacoes = await financeiroService.getMovimentacoes();

      
      // Filtrar movimentações por período
      const movimentacoesPeriodo = movimentacoes.filter((mov: any) => {
        const dataMov = new Date(mov.data_movimentacao);
        return dataMov >= dataInicio && dataMov <= hoje;
      });
      


      // Calcular estatísticas
      const entradasFiltradas = movimentacoesPeriodo.filter((mov: any) => mov.tipo === 'ENTRADA');
      const totalEntradas = entradasFiltradas.length > 0 
        ? entradasFiltradas.reduce((acc: number, mov: any) => acc + mov.valor, 0)
        : 0;
        
      const saidasFiltradas = movimentacoesPeriodo.filter((mov: any) => mov.tipo === 'SAIDA');
      const totalSaidas = saidasFiltradas.length > 0
        ? saidasFiltradas.reduce((acc: number, mov: any) => acc + mov.valor, 0)
        : 0;
        
      const saldoLiquido = totalEntradas - totalSaidas;
      
      // Criar dados para o gráfico (dinâmico baseado no período selecionado)
      const dadosGrafico = [];
      const diasPeriodo = parseInt(periodo);
      
      if (diasPeriodo <= 7) {
        // Para períodos de 7 dias ou menos, mostrar por dia da semana
        
        for (let i = 0; i < diasPeriodo; i++) {
          const dia = new Date(hoje);
          dia.setDate(hoje.getDate() - (diasPeriodo - 1 - i));
          
          const faturamentoDiaFiltrado = movimentacoesPeriodo
            .filter((mov: any) => {
              const dataMov = new Date(mov.data_movimentacao);
              return dataMov.toDateString() === dia.toDateString() && mov.tipo === 'ENTRADA';
            });
          
          const faturamentoDia = faturamentoDiaFiltrado.length > 0
            ? faturamentoDiaFiltrado.reduce((acc: number, mov: any) => acc + mov.valor, 0)
            : 0;
          
          dadosGrafico.push({
            day: obterDiaDaSemana(dia),
            faturamento: faturamentoDia
          });
        }
      } else if (diasPeriodo === 30) {
        // Para período de 30 dias, mostrar cada dia individual
        for (let i = 0; i < diasPeriodo; i++) {
          const dia = new Date(hoje);
          dia.setDate(hoje.getDate() - (diasPeriodo - 1 - i));
          
          const faturamentoDiaFiltrado = movimentacoesPeriodo
            .filter((mov: any) => {
              const dataMov = new Date(mov.data_movimentacao);
              return dataMov.toDateString() === dia.toDateString() && mov.tipo === 'ENTRADA';
            });
          
          const faturamentoDia = faturamentoDiaFiltrado.length > 0
            ? faturamentoDiaFiltrado.reduce((acc: number, mov: any) => acc + mov.valor, 0)
            : 0;
          
          dadosGrafico.push({
            day: `${dia.getDate()}/${dia.getMonth() + 1}`,
            faturamento: faturamentoDia
          });
        }
      } else {
        // Para períodos de 90 dias, agrupar por semanas
        const semanas = Math.ceil(diasPeriodo / 7);
        
        for (let i = 0; i < semanas; i++) {
          const inicioDaSemana = new Date(hoje);
          inicioDaSemana.setDate(hoje.getDate() - (diasPeriodo - 1) + (i * 7));
          
          const fimDaSemana = new Date(inicioDaSemana);
          fimDaSemana.setDate(inicioDaSemana.getDate() + 6);
          
          // Garantir que não passe da data atual
          if (fimDaSemana > hoje) {
            fimDaSemana.setTime(hoje.getTime());
          }
          
          const faturamentoSemana = movimentacoesPeriodo
            .filter((mov: any) => {
              const dataMov = new Date(mov.data_movimentacao);
              return dataMov >= inicioDaSemana && dataMov <= fimDaSemana && mov.tipo === 'ENTRADA';
            })
            .reduce((acc: number, mov: any) => acc + mov.valor, 0);
          
          dadosGrafico.push({
            day: `${inicioDaSemana.getDate()}/${inicioDaSemana.getMonth() + 1} - ${fimDaSemana.getDate()}/${fimDaSemana.getMonth() + 1}`,
            faturamento: faturamentoSemana
          });
        }
      }


      setChartData(dadosGrafico);

      // Criar cards de estatísticas
      const calcularVariacao = (atual: number, anterior: number) => {
        if (anterior === 0) return atual > 0 ? 100 : 0;
        return ((atual - anterior) / anterior) * 100;
      };

      // Calcular período anterior real
      const periodoEmDias = parseInt(periodo);
      const dataInicioAnterior = new Date(dataInicio);
      dataInicioAnterior.setDate(dataInicioAnterior.getDate() - periodoEmDias);
      
      const dataFimAnterior = new Date(dataInicio);
      dataFimAnterior.setDate(dataFimAnterior.getDate() - 1);

      const movimentacoesAnteriores = movimentacoes.filter((mov: any) => {
        const dataMovimentacao = new Date(mov.data_movimentacao);
        return dataMovimentacao >= dataInicioAnterior && dataMovimentacao <= dataFimAnterior;
      });

      const totalEntradasAnterior = movimentacoesAnteriores
        .filter((mov: any) => mov.tipo === 'ENTRADA')
        .reduce((total: number, mov: any) => total + mov.valor, 0);
      
      const totalSaidasAnterior = movimentacoesAnteriores
        .filter((mov: any) => mov.tipo === 'SAIDA')
        .reduce((total: number, mov: any) => total + mov.valor, 0);
      
      const saldoAnterior = totalEntradasAnterior - totalSaidasAnterior;

      const cards = [
        {
          label: 'Faturamento',
          value: `R$ ${totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          change: calcularVariacao(totalEntradas, totalEntradasAnterior),
          icon: DollarSign,
          color: 'green'
        },
        {
          label: 'Entradas',
          value: `R$ ${totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          change: calcularVariacao(totalEntradas, totalEntradasAnterior),
          icon: TrendingUp,
          color: 'green'
        },
        {
          label: 'Saídas',
          value: `R$ ${totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          change: calcularVariacao(totalSaidas, totalSaidasAnterior),
          icon: TrendingDown,
          color: 'red'
        },
        {
          label: 'Saldo Líquido',
          value: `R$ ${saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          change: calcularVariacao(saldoLiquido, saldoAnterior),
          icon: Wallet,
          color: saldoLiquido >= 0 ? 'green' : 'red'
        }
      ];

      setStatsCards(cards);

      // Dados gerais do dashboard
      setDadosDashboard({
        totalReceitas: totalEntradas,
        totalDespesas: totalSaidas,
        saldoLiquido,
        totalServicos: movimentacoesPeriodo.filter((mov: any) => mov.tipo === 'ENTRADA').length,
        ticketMedio: totalEntradas > 0 ? totalEntradas / movimentacoesPeriodo.filter((mov: any) => mov.tipo === 'ENTRADA').length : 0,
        periodo: periodo
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do dashboard.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCarregando(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosDashboard();
  }, [periodo]);

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      
      if (!dadosDashboard) {
        throw new Error('Dados não carregados');
      }

      // Criar dados para o relatório
      const dadosRelatorio = {
        periodo: periodo,
        dataInicio: new Date(Date.now() - parseInt(periodo) * 24 * 60 * 60 * 1000),
        dataFim: new Date(),
        totalEntradas: dadosDashboard.totalReceitas,
        totalSaidas: dadosDashboard.totalDespesas,
        saldoLiquido: dadosDashboard.saldoLiquido,
        margemLucro: dadosDashboard.totalReceitas > 0 ? ((dadosDashboard.saldoLiquido / dadosDashboard.totalReceitas) * 100) : 0,
        totalServicos: dadosDashboard.totalServicos,
        ticketMedio: dadosDashboard.ticketMedio,
        crescimentoReceita: 12.5, // Valor exemplo - implementar cálculo real
        relatorioFuncionarios: [],
        servicosPopulares: [],
        movimentacoes: []
      };

      await pdfExportService.exportarRelatorio(dadosRelatorio);
      
      toast({
        title: 'PDF exportado!',
        description: 'O relatório do dashboard foi exportado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar o relatório.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setExportingPDF(false);
    }
  };

  if (carregando) {
    return (
      <Box minH="400px" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text color={textColor}>Carregando dados do dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Cabeçalho */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color={headingColor}>
              Dashboard Financeiro
            </Heading>
            <Text color={textColor}>
              Visão geral das finanças e operações
            </Text>
          </VStack>
          <HStack spacing={4}>
            <Button
              leftIcon={<RepeatIcon />}
              variant="outline"
              colorScheme="gray"
              onClick={carregarDadosDashboard}
              isLoading={loading}
              loadingText="Atualizando..."
              size="sm"
            >
              Atualizar
            </Button>
            <Select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              w="200px"
              bg={selectBg}
              color={headingColor}
              borderColor={borderColor}
              _hover={{
                borderColor: 'brand.300'
              }}
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </Select>
            <Button
              leftIcon={<Download size={16} />}
              colorScheme="brand"
              onClick={handleExportPDF}
              isLoading={exportingPDF}
              loadingText="Exportando..."
            >
              Exportar PDF
            </Button>
          </HStack>
        </HStack>

        {/* Cards de Estatísticas */}
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6}>
          {statsCards.map((stat) => (
            <Card
              key={stat.label}
              bg={cardBg}
              borderWidth="1px"
              borderColor={cardBorderColor}
              borderRadius="xl"
              overflow="hidden"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'xl',
              }}
              transition="all 0.3s ease"
            >
              <CardBody>
                <HStack spacing={4}>
                  <Box
                    w={12}
                    h={12}
                    bg={`${stat.color}.500`}
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={stat.icon} w={6} h={6} color="white" />
                  </Box>
                  <VStack align="start" spacing={1} flex={1}>
                    <Stat>
                      <StatLabel fontSize="sm" color={statLabelColor}>
                        {stat.label}
                      </StatLabel>
                      <StatNumber fontSize="2xl" fontWeight="bold" color={statNumberColor}>
                        {stat.value}
                      </StatNumber>
                      <StatHelpText mb={0}>
                        <StatArrow type={stat.change >= 0 ? 'increase' : 'decrease'} />
                        {Math.abs(stat.change).toFixed(1)}% vs período anterior
                      </StatHelpText>
                    </Stat>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Gráfico de Faturamento */}
        <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={6}>
          <Card bg={cardBg} p={6} borderRadius="xl" shadow="sm" borderColor={cardBorderColor}>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <HStack spacing={3}>
                  <Icon as={BarChart3} w={5} h={5} color="brand.500" />
                  <Heading size="md" color={headingColor}>
                    Faturamento por {periodo === '7' ? 'Dia' : periodo === '30' ? 'Dia' : 'Semana'}
                  </Heading>
                </HStack>
                <Text fontSize="sm" color={textColor}>
                  {periodos.find(p => p.value === periodo)?.label}
                </Text>
              </HStack>
              
              <Box h="300px" w="full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8B4CB" />
                        <stop offset="100%" stopColor="#D4AF37" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="day" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip
                      formatter={(value: any) => [`R$ ${value.toLocaleString()}`, 'Faturamento']}
                      labelStyle={{ color: '#666' }}
                      contentStyle={{
                        backgroundColor: cardBg,
                        border: `1px solid ${cardBorderColor}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="faturamento" 
                      fill="url(#barGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </VStack>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};
