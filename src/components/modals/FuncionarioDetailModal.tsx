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
  SimpleGrid
} from '@chakra-ui/react';
import { financeiroService } from '../../services/api';

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
  faturamento_total?: number;
  servicos_realizados?: number;
  ticket_medio?: number;
}

interface FuncionarioDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionario?: Funcionario | null;
}

interface PerformanceFuncionario {
  faturamento_mes: number;
  faturamento_semana: number;
  servicos_mes: number;
  servicos_semana: number;
  ticket_medio: number;
  comissao_calculada: number;
}

export const FuncionarioDetailModal: React.FC<FuncionarioDetailModalProps> = ({
  isOpen,
  onClose,
  funcionario
}) => {
  const [performance, setPerformance] = useState<PerformanceFuncionario>({
    faturamento_mes: 0,
    faturamento_semana: 0,
    servicos_mes: 0,
    servicos_semana: 0,
    ticket_medio: 0,
    comissao_calculada: 0
  });

  useEffect(() => {
    if (funcionario && isOpen) {
      carregarPerformance();
    }
  }, [funcionario, isOpen]);

  const carregarPerformance = async () => {
    if (!funcionario) return;
    
    try {
      // Buscar movimentações do funcionário
      const movimentacoes = await financeiroService.getMovimentacoes();
      const movimentacoesFuncionario = movimentacoes.filter(
        (m: any) => m.funcionario?.id === funcionario.id && m.tipo === 'ENTRADA'
      );

      // Calcular datas
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());

      // Filtrar por período
      const movimentacoesMes = movimentacoesFuncionario.filter(
        (m: any) => new Date(m.data_movimentacao) >= inicioMes
      );
      const movimentacoesSemana = movimentacoesFuncionario.filter(
        (m: any) => new Date(m.data_movimentacao) >= inicioSemana
      );

      // Calcular estatísticas
      const faturamento_mes = movimentacoesMes.reduce((sum: number, m: any) => sum + m.valor, 0);
      const faturamento_semana = movimentacoesSemana.reduce((sum: number, m: any) => sum + m.valor, 0);
      const servicos_mes = movimentacoesMes.length;
      const servicos_semana = movimentacoesSemana.length;
      const ticket_medio = servicos_mes > 0 ? faturamento_mes / servicos_mes : 0;
      const comissao_calculada = funcionario.comissao_percentual 
        ? (faturamento_mes * funcionario.comissao_percentual) / 100 
        : 0;

      setPerformance({
        faturamento_mes,
        faturamento_semana,
        servicos_mes,
        servicos_semana,
        ticket_medio,
        comissao_calculada
      });
    } catch (error) {
      console.error('Erro ao carregar performance:', error);
    }
  };

  const calcularProgressoMeta = (tipo: 'semanal' | 'mensal') => {
    if (!funcionario) return 0;
    
    const meta = tipo === 'semanal' ? funcionario.meta_semanal : funcionario.meta_mensal;
    const faturamento = tipo === 'semanal' ? performance.faturamento_semana : performance.faturamento_mes;
    
    if (!meta || meta === 0) return 0;
    return Math.min((faturamento / meta) * 100, 100);
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

  if (!funcionario) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Avatar 
              size="md" 
              name={`${funcionario.nome} ${funcionario.sobrenome}`}
              bg="rosa.400"
              color="white"
            />
            <Box>
              <Text fontSize="lg" fontWeight="bold" color="rosa.600">
                {funcionario.nome} {funcionario.sobrenome}
              </Text>
              <Badge colorScheme={getFuncaoColor(funcionario.funcao)}>
                {funcionario.funcao}
              </Badge>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Informações Básicas */}
            <Box>
              <Text fontWeight="bold" mb={3} color="gray.700">
                Informações de Contato
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontSize="sm" color="gray.600">Email</Text>
                  <Text fontWeight="medium">{funcionario.email}</Text>
                </GridItem>
                <GridItem>
                  <Text fontSize="sm" color="gray.600">Telefone</Text>
                  <Text fontWeight="medium">{funcionario.telefone || 'Não informado'}</Text>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Metas */}
            <Box>
              <Text fontWeight="bold" mb={3} color="gray.700">
                Metas e Progresso
              </Text>
              <SimpleGrid columns={2} spacing={4}>
                {/* Meta Semanal */}
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600" mb={2}>Meta Semanal</Text>
                  <Text fontSize="lg" fontWeight="bold" mb={2}>
                    R$ {funcionario.meta_semanal?.toLocaleString() || '0'}
                  </Text>
                  <Progress 
                    value={calcularProgressoMeta('semanal')} 
                    size="sm" 
                    colorScheme="blue"
                    mb={1}
                  />
                  <Text fontSize="xs" color="gray.600">
                    {calcularProgressoMeta('semanal').toFixed(1)}% atingido
                  </Text>
                </Box>

                {/* Meta Mensal */}
                <Box p={4} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" color="gray.600" mb={2}>Meta Mensal</Text>
                  <Text fontSize="lg" fontWeight="bold" mb={2}>
                    R$ {funcionario.meta_mensal?.toLocaleString() || '0'}
                  </Text>
                  <Progress 
                    value={calcularProgressoMeta('mensal')} 
                    size="sm" 
                    colorScheme="rosa"
                    mb={1}
                  />
                  <Text fontSize="xs" color="gray.600">
                    {calcularProgressoMeta('mensal').toFixed(1)}% atingido
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Performance */}
            <Box>
              <Text fontWeight="bold" mb={3} color="gray.700">
                Performance do Mês
              </Text>
              <SimpleGrid columns={2} spacing={4}>
                <Stat>
                  <StatLabel>Faturamento Mensal</StatLabel>
                  <StatNumber color="green.500">
                    R$ {performance.faturamento_mes.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    Semana: R$ {performance.faturamento_semana.toLocaleString()}
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Serviços Realizados</StatLabel>
                  <StatNumber color="blue.500">
                    {performance.servicos_mes}
                  </StatNumber>
                  <StatHelpText>
                    Semana: {performance.servicos_semana}
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Ticket Médio</StatLabel>
                  <StatNumber color="purple.500">
                    R$ {performance.ticket_medio.toLocaleString()}
                  </StatNumber>
                </Stat>

                <Stat>
                  <StatLabel>Comissão do Mês</StatLabel>
                  <StatNumber color="rosa.500">
                    R$ {performance.comissao_calculada.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    {funcionario.comissao_percentual || 0}% do faturamento
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
            </Box>

            {/* Status */}
            <Box>
              <Text fontWeight="bold" mb={3} color="gray.700">
                Status do Funcionário
              </Text>
              <HStack>
                <Badge 
                  colorScheme={funcionario.ativo ? 'green' : 'red'} 
                  fontSize="md" 
                  p={2}
                >
                  {funcionario.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </HStack>
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
