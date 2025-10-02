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
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Box,
  Progress,
  SimpleGrid,
  Card,
  CardBody
} from '@chakra-ui/react';
import { financeiroService } from '../../services/api';

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
  vendas_mes?: number;
  faturamento_mes?: number;
  ticket_medio?: number;
  popularidade?: number;
}

interface ServicoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  servico?: Servico | null;
  funcionarios: Funcionario[];
}

interface PerformanceServico {
  vendas_total: number;
  vendas_mes: number;
  vendas_semana: number;
  faturamento_total: number;
  faturamento_mes: number;
  faturamento_semana: number;
  ticket_medio: number;
  preco_medio_praticado: number;
  vendas_por_funcionario: { [key: string]: number };
}

export const ServicoDetailModal: React.FC<ServicoDetailModalProps> = ({
  isOpen,
  onClose,
  servico,
  funcionarios
}) => {
  const [performance, setPerformance] = useState<PerformanceServico>({
    vendas_total: 0,
    vendas_mes: 0,
    vendas_semana: 0,
    faturamento_total: 0,
    faturamento_mes: 0,
    faturamento_semana: 0,
    ticket_medio: 0,
    preco_medio_praticado: 0,
    vendas_por_funcionario: {}
  });

  useEffect(() => {
    if (servico && isOpen) {
      carregarPerformance();
    }
  }, [servico, isOpen]);

  const carregarPerformance = async () => {
    if (!servico) return;
    
    try {
      // Buscar todas as movimentações do serviço
      const movimentacoes = await financeiroService.getMovimentacoes();
      const vendasServico = movimentacoes.filter(
        (m: any) => m.servico?.id === servico.id && m.tipo === 'ENTRADA'
      );

      // Calcular datas
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());

      // Filtrar por períodos
      const vendasMes = vendasServico.filter(
        (v: any) => new Date(v.data_movimentacao) >= inicioMes
      );
      const vendasSemana = vendasServico.filter(
        (v: any) => new Date(v.data_movimentacao) >= inicioSemana
      );

      // Calcular estatísticas
      const vendas_total = vendasServico.length;
      const vendas_mes = vendasMes.length;
      const vendas_semana = vendasSemana.length;
      
      const faturamento_total = vendasServico.reduce((sum: number, v: any) => sum + v.valor, 0);
      const faturamento_mes = vendasMes.reduce((sum: number, v: any) => sum + v.valor, 0);
      const faturamento_semana = vendasSemana.reduce((sum: number, v: any) => sum + v.valor, 0);
      
      const ticket_medio = vendas_total > 0 ? faturamento_total / vendas_total : servico.valor_base;
      const preco_medio_praticado = vendas_mes > 0 ? faturamento_mes / vendas_mes : servico.valor_base;

      // Vendas por funcionário
      const vendas_por_funcionario: { [key: string]: number } = {};
      vendasMes.forEach((venda: any) => {
        if (venda.funcionario?.id) {
          const funcionarioId = venda.funcionario.id;
          vendas_por_funcionario[funcionarioId] = (vendas_por_funcionario[funcionarioId] || 0) + 1;
        }
      });

      setPerformance({
        vendas_total,
        vendas_mes,
        vendas_semana,
        faturamento_total,
        faturamento_mes,
        faturamento_semana,
        ticket_medio,
        preco_medio_praticado,
        vendas_por_funcionario
      });
    } catch (error) {
      console.error('Erro ao carregar performance:', error);
    }
  };

  const getNomeFuncionario = (funcionarioId?: string) => {
    if (!funcionarioId) return 'Não definido';
    const funcionario = funcionarios.find(f => f.id === funcionarioId);
    return funcionario ? `${funcionario.nome} ${funcionario.sobrenome}` : 'Funcionário não encontrado';
  };

  const getFuncionarioMaisVendeu = () => {
    const vendas = performance.vendas_por_funcionario;
    const funcionarioId = Object.keys(vendas).reduce((a, b) => vendas[a] > vendas[b] ? a : b, '');
    return funcionarioId ? getNomeFuncionario(funcionarioId) : 'Nenhum';
  };

  const calcularVariacaoPreco = () => {
    const diferenca = performance.preco_medio_praticado - servico!.valor_base;
    const percentual = (diferenca / servico!.valor_base) * 100;
    return { diferenca, percentual };
  };

  if (!servico) return null;

  const variacaoPreco = calcularVariacaoPreco();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack align="flex-start" spacing={2}>
            <Text fontSize="lg" fontWeight="bold" color="rosa.600">
              {servico.nome}
            </Text>
            <HStack>
              <Badge colorScheme={servico.ativo ? 'green' : 'red'}>
                {servico.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
              <Text fontSize="lg" fontWeight="bold" color="green.500">
                R$ {servico.valor_base.toLocaleString()}
              </Text>
            </HStack>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Informações Básicas */}
            <Box>
              <Text fontWeight="bold" mb={3} color="gray.700">
                Informações do Serviço
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontSize="sm" color="gray.600">Funcionário Responsável</Text>
                  <HStack>
                    <Avatar 
                      size="xs" 
                      name={getNomeFuncionario(servico.funcionario_responsavel_id)}
                      bg="rosa.400"
                      color="white"
                    />
                    <Text fontWeight="medium">
                      {getNomeFuncionario(servico.funcionario_responsavel_id)}
                    </Text>
                  </HStack>
                </GridItem>
                <GridItem>
                  <Text fontSize="sm" color="gray.600">Preço Base</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    R$ {servico.valor_base.toLocaleString()}
                  </Text>
                </GridItem>
              </Grid>
              
              {servico.descricao && (
                <Box mt={4}>
                  <Text fontSize="sm" color="gray.600" mb={1}>Descrição</Text>
                  <Text>{servico.descricao}</Text>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Performance Geral */}
            <Box>
              <Text fontWeight="bold" mb={3} color="gray.700">
                Performance de Vendas
              </Text>
              <SimpleGrid columns={2} spacing={4}>
                <Stat>
                  <StatLabel>Vendas do Mês</StatLabel>
                  <StatNumber color="blue.500">
                    {performance.vendas_mes}
                  </StatNumber>
                  <StatHelpText>
                    Semana: {performance.vendas_semana} | Total: {performance.vendas_total}
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Faturamento do Mês</StatLabel>
                  <StatNumber color="green.500">
                    R$ {performance.faturamento_mes.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    Semana: R$ {performance.faturamento_semana.toLocaleString()}
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Preço Médio Praticado</StatLabel>
                  <StatNumber color={variacaoPreco.diferenca >= 0 ? 'green.500' : 'red.500'}>
                    R$ {performance.preco_medio_praticado.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    {variacaoPreco.diferenca >= 0 ? '+' : ''}
                    R$ {variacaoPreco.diferenca.toLocaleString()} 
                    ({variacaoPreco.percentual.toFixed(1)}%)
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Ticket Médio Histórico</StatLabel>
                  <StatNumber color="purple.500">
                    R$ {performance.ticket_medio.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    Baseado em todas as vendas
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Análise de Funcionários */}
            <Box>
              <Text fontWeight="bold" mb={3} color="gray.700">
                Performance por Funcionário (Este Mês)
              </Text>
              
              {Object.keys(performance.vendas_por_funcionario).length > 0 ? (
                <VStack spacing={3} align="stretch">
                  {Object.entries(performance.vendas_por_funcionario)
                    .sort(([,a], [,b]) => b - a)
                    .map(([funcionarioId, vendas]) => {
                      const funcionario = funcionarios.find(f => f.id === funcionarioId);
                      const totalVendas = Object.values(performance.vendas_por_funcionario).reduce((sum, v) => sum + v, 0);
                      const percentual = totalVendas > 0 ? (vendas / totalVendas) * 100 : 0;
                      
                      return (
                        <Card key={funcionarioId} variant="outline" size="sm">
                          <CardBody>
                            <HStack justify="space-between">
                              <HStack>
                                <Avatar 
                                  size="sm" 
                                  name={funcionario ? `${funcionario.nome} ${funcionario.sobrenome}` : 'Desconhecido'}
                                  bg="rosa.400"
                                  color="white"
                                />
                                <Box>
                                  <Text fontWeight="medium">
                                    {funcionario ? `${funcionario.nome} ${funcionario.sobrenome}` : 'Funcionário Desconhecido'}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {funcionario?.funcao || 'Função não definida'}
                                  </Text>
                                </Box>
                              </HStack>
                              <VStack spacing={1} align="flex-end">
                                <Text fontWeight="bold" color="blue.500">
                                  {vendas} vendas
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {percentual.toFixed(1)}% do total
                                </Text>
                              </VStack>
                            </HStack>
                            <Progress 
                              value={percentual} 
                              size="sm" 
                              colorScheme="rosa"
                              mt={2}
                            />
                          </CardBody>
                        </Card>
                      );
                    })}
                    
                  <Box p={3} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontWeight="bold" color="gray.700">
                      🏆 Funcionário que mais vendeu: {getFuncionarioMaisVendeu()}
                    </Text>
                  </Box>
                </VStack>
              ) : (
                <Text color="gray.500" textAlign="center" py={4}>
                  Nenhuma venda registrada neste mês
                </Text>
              )}
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="rosa" onClick={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};