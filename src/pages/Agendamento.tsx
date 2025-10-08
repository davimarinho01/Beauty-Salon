import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  useDisclosure,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  Grid,
  GridItem,
  useColorModeValue,
  useBreakpointValue,
  Collapse,
  Flex,
  Wrap,
  WrapItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon, CalendarIcon, RepeatIcon } from '@chakra-ui/icons';
import { FaGoogle } from 'react-icons/fa';
import { agendamentoService, funcionarioService, servicoService } from '../services/api';
import { AgendamentoFormModal } from '../components/modals/AgendamentoFormModal';
import { GoogleCalendarConfigModal } from '../components/modals/GoogleCalendarConfigModal';
import { googleCalendarService } from '../services/googleCalendar';
import { EventoGoogle } from '../types';

interface Funcionario {
  id: string;
  nome: string;
  sobrenome: string;
  funcao: string;
  email: string;
}

interface Servico {
  id: string;
  nome: string;
  valor_base: number;
  funcionario_responsavel_id: string;
  funcionario?: Funcionario;
}

interface Agendamento {
  id: string;
  servico_id: string;
  funcionario_id: string;
  cliente_nome: string;
  cliente_telefone?: string;
  data_agendamento: string;
  horario: string;
  horario_fim?: string;
  status: 'AGENDADO' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO';
  observacoes?: string;
  funcionario?: Funcionario;
  servico?: Servico;
  servicos?: Array<{
    id: string;
    servico_id: string;
    servico?: Servico;
    ordem: number;
  }>;
  funcionarios?: Array<{
    id: string;
    funcionario_id: string;
    funcionario?: Funcionario;
    responsavel_principal: boolean;
    ordem: number;
  }>;
}

const HORARIOS_FUNCIONAMENTO = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00'
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const Agendamento: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [eventosGoogle, setEventosGoogle] = useState<EventoGoogle[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [semanaAtual, setSemanaAtual] = useState(new Date());
  const [funcionarioFiltro, setFuncionarioFiltro] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);
  const toast = useToast();

  // Responsividade
  const isMobile = useBreakpointValue({ base: true, md: false });
  const calendarColumns = useBreakpointValue({ 
    base: `50px repeat(7, 1fr)`, 
    md: `80px repeat(7, 1fr)` 
  });

  // Cores do modo escuro/claro
  const bgColor = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const cellBg = useColorModeValue('white', 'gray.800');
  const cellWithAgendamentoBg = useColorModeValue('gray.50', 'gray.700');
  const lightBorderColor = useColorModeValue('gray.100', 'gray.700');
  const headingColor = useColorModeValue('rosa.600', 'rosa.300');
  const selectBg = useColorModeValue('white', 'gray.700');
  const selectColor = useColorModeValue('gray.800', 'gray.100');
  const selectBorderColor = useColorModeValue('gray.200', 'gray.600');
  const selectHoverBorderColor = useColorModeValue('brand.300', 'brand.400');

  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isGoogleConfigOpen, onOpen: onGoogleConfigOpen, onClose: onGoogleConfigClose } = useDisclosure();
  const { isOpen: isActionsOpen, onOpen: onActionsOpen, onClose: onActionsClose } = useDisclosure();

  // Verificar conexão Google Calendar na inicialização
  useEffect(() => {
    const verificarConexaoGoogle = async () => {
      const connected = await googleCalendarService.isConnected();
      setIsGoogleConnected(connected);
    };
    verificarConexaoGoogle();
  }, []);

  // Calcular início e fim da semana
  const getInicioSemana = (data: Date) => {
    const inicio = new Date(data);
    inicio.setDate(data.getDate() - data.getDay()); // Domingo
    return inicio;
  };

  const getFimSemana = (data: Date) => {
    const fim = new Date(data);
    fim.setDate(data.getDate() - data.getDay() + 6); // Sábado
    return fim;
  };

  const inicioSemana = getInicioSemana(semanaAtual);
  const fimSemana = getFimSemana(semanaAtual);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Verificar se há conexão com Google Calendar e sincronizar automaticamente
      try {
        const isAuthenticated = await googleCalendarService.isConnected();
        if (isAuthenticated) {
          // Sincronizar criações/edições
          await googleCalendarService.syncAllAgendamentos();
          
          // Sincronizar exclusões (silenciosamente)
          await googleCalendarService.syncDeletionsFromGoogleCalendar();
        }
      } catch (syncError: any) {
        // Se token expirou, mostrar aviso para o usuário
        if (syncError.message && syncError.message.includes('Token expirado')) {
          setIsGoogleConnected(false);
          toast({
            title: 'Google Calendar desconectado',
            description: 'Token expirado. Reconecte-se ao Google Calendar.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
        // Sincronização automática falhou, continuar sem sincronizar
      }
      
      const dataInicio = inicioSemana.toISOString().split('T')[0];
      const dataFim = fimSemana.toISOString().split('T')[0];

      const [agendamentosData, eventosGoogleData, funcionariosData, servicosData] = await Promise.all([
        agendamentoService.getByDate(dataInicio, dataFim),
        googleCalendarService.getEventosGoogle(inicioSemana, fimSemana),
        funcionarioService.getAll(),
        servicoService.getAll()
      ]);

      setAgendamentos(agendamentosData);
      setEventosGoogle(eventosGoogleData);
      setFuncionarios(funcionariosData);
      setServicos(servicosData);
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os agendamentos.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [semanaAtual]);

  const handleNovoAgendamento = () => {
    onFormOpen();
  };

  const handleSalvarAgendamento = async (dadosAgendamento: any) => {
    try {
      await agendamentoService.create(dadosAgendamento);
      toast({
        title: 'Agendamento criado',
        description: 'Novo agendamento foi criado com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      await carregarDados();
      onFormClose();
    } catch (error) {
      toast({
        title: 'Erro ao criar agendamento',
        description: 'Não foi possível criar o agendamento.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAlterarStatus = async (agendamentoId: string, novoStatus: string) => {
    try {
      await agendamentoService.updateStatus(agendamentoId, novoStatus);
      toast({
        title: 'Status atualizado',
        description: 'O status do agendamento foi atualizado.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      await carregarDados();
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleExcluirAgendamento = async (agendamentoId: string) => {
    try {
      await agendamentoService.delete(agendamentoId);
      toast({
        title: 'Agendamento excluído',
        description: 'O agendamento foi excluído com sucesso.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      await carregarDados();
    } catch (error) {
      toast({
        title: 'Erro ao excluir agendamento',
        description: 'Não foi possível excluir o agendamento.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSincronizarExclusoes = async () => {
    const isConnected = await googleCalendarService.isConnected();
    if (!isConnected) {
      toast({
        title: 'Google Calendar não conectado',
        description: 'Conecte-se ao Google Calendar primeiro.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      
      const resultado = await googleCalendarService.syncDeletionsFromGoogleCalendar();
      
      toast({
        title: 'Sincronização concluída',
        description: `${resultado.deletedEventos} eventos e ${resultado.deletedAgendamentos} agendamentos removidos.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      
      await carregarDados();
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível sincronizar as exclusões.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConfigClose = async () => {
    onGoogleConfigClose();
    // Verificar novamente a conexão após fechar o modal
    const connected = await googleCalendarService.isConnected();
    setIsGoogleConnected(connected);
    if (connected) {
      await carregarDados();
    }
  };

  const navegarSemana = (direcao: 'anterior' | 'proxima') => {
    const novaSemana = new Date(semanaAtual);
    if (direcao === 'anterior') {
      novaSemana.setDate(semanaAtual.getDate() - 7);
    } else {
      novaSemana.setDate(semanaAtual.getDate() + 7);
    }
    setSemanaAtual(novaSemana);
  };

  const getTodosEventosPorDiaHora = (dia: Date, hora: string) => {
    const dataStr = dia.toISOString().split('T')[0];
    
    // Buscar agendamentos regulares
    let agendamentosDoDia = agendamentos.filter(ag => {
      // Normalizar horário - remover segundos se existir
      const horarioNormalizado = ag.horario.substring(0, 5); // Pega apenas HH:MM
      const horaComparação = hora.substring(0, 5); // Garante que também está em HH:MM
      
      return ag.data_agendamento === dataStr && horarioNormalizado === horaComparação;
    });

    if (funcionarioFiltro) {
      agendamentosDoDia = agendamentosDoDia.filter(
        ag => ag.funcionario_id === funcionarioFiltro
      );
    }

    // Buscar eventos do Google Calendar
    const eventosGoogleDoDia = eventosGoogle.filter(evento => {
      if (!evento.data_inicio) return false;
      
      // Extrair data e hora do data_inicio (formato ISO)
      const dataInicio = new Date(evento.data_inicio);
      const eventDataStr = dataInicio.toISOString().split('T')[0];
      const eventoHora = dataInicio.toTimeString().substring(0, 5);
      const horaComparação = hora.substring(0, 5);
      
      return eventDataStr === dataStr && eventoHora === horaComparação;
    });

    // Combinar agendamentos e eventos do Google
    return [...agendamentosDoDia, ...eventosGoogleDoDia];
  };

  const getStatusColor = (status: string) => {
    const cores = {
      'AGENDADO': 'blue',
      'CONFIRMADO': 'green',
      'REALIZADO': 'purple',
      'CANCELADO': 'red'
    };
    return cores[status as keyof typeof cores] || 'gray';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'AGENDADO': 'Agendado',
      'CONFIRMADO': 'Confirmado',
      'REALIZADO': 'Realizado',
      'CANCELADO': 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getDiasSemana = () => {
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      dias.push(dia);
    }
    return dias;
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text>Carregando agendamentos...</Text>
      </Box>
    );
  }

  const diasSemana = getDiasSemana();

  return (
    <Box p={{ base: 3, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* Cabeçalho */}
        <VStack spacing={3} align="stretch">
          <Heading size={{ base: 'md', md: 'lg' }} color={headingColor} textAlign={{ base: 'center', md: 'left' }}>
            Agenda da Semana
          </Heading>
          
          {/* Controles Mobile/Desktop */}
          {isMobile ? (
            <VStack spacing={3}>
              {/* Filtro e botões principais */}
              <HStack w="full" spacing={2}>
                <Select
                  placeholder="Todos"
                  value={funcionarioFiltro}
                  onChange={(e) => setFuncionarioFiltro(e.target.value)}
                  size="sm"
                  bg={selectBg}
                  color={selectColor}
                  borderColor={selectBorderColor}
                  flex={1}
                >
                  {funcionarios.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </option>
                  ))}
                </Select>
                <IconButton
                  icon={<AddIcon />}
                  colorScheme="rosa"
                  onClick={handleNovoAgendamento}
                  size="sm"
                  aria-label="Novo agendamento"
                />
              </HStack>
              
              {/* Botões do Google Calendar */}
              <Wrap spacing={2} justify="center" w="full">
                <WrapItem>
                  <Button
                    leftIcon={<FaGoogle />}
                    colorScheme={isGoogleConnected ? "green" : "red"}
                    variant={isGoogleConnected ? "solid" : "outline"}
                    onClick={onGoogleConfigOpen}
                    size="sm"
                    fontSize="xs"
                  >
                    {isGoogleConnected ? "Google ✓" : "Conectar"}
                  </Button>
                </WrapItem>
                {isGoogleConnected && (
                  <WrapItem>
                    <Button
                      leftIcon={<RepeatIcon />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={handleSincronizarExclusoes}
                      isLoading={loading}
                      loadingText="..."
                      size="sm"
                      fontSize="xs"
                    >
                      Sync
                    </Button>
                  </WrapItem>
                )}
              </Wrap>
            </VStack>
          ) : (
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <HStack spacing={3} flexWrap="wrap">
                <Select
                  placeholder="Todos os funcionários"
                  value={funcionarioFiltro}
                  onChange={(e) => setFuncionarioFiltro(e.target.value)}
                  maxW="300px"
                  size="md"
                  bg={selectBg}
                  color={selectColor}
                  borderColor={selectBorderColor}
                  _hover={{
                    borderColor: selectHoverBorderColor
                  }}
                >
                  {funcionarios.map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome} {funcionario.sobrenome}
                    </option>
                  ))}
                </Select>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="rosa"
                  onClick={handleNovoAgendamento}
                  size="md"
                >
                  Novo Agendamento
                </Button>
                <Button
                  leftIcon={<FaGoogle />}
                  colorScheme={isGoogleConnected ? "green" : "red"}
                  variant={isGoogleConnected ? "solid" : "outline"}
                  onClick={onGoogleConfigOpen}
                  size="md"
                >
                  {isGoogleConnected ? "Google Calendar Conectado" : "Conectar Google Calendar"}
                </Button>
                {isGoogleConnected && (
                  <Button
                    leftIcon={<RepeatIcon />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={handleSincronizarExclusoes}
                    isLoading={loading}
                    loadingText="Atualizando..."
                    size="md"
                  >
                    Atualizar
                  </Button>
                )}
              </HStack>
            </HStack>
          )}
        </VStack>

        {/* Navegação da Semana */}
        <VStack spacing={2}>
          <Flex justify="space-between" align="center" w="full">
            <IconButton
              onClick={() => navegarSemana('anterior')} 
              variant="outline"
              size={{ base: 'sm', md: 'md' }}
              icon={<Text>←</Text>}
              aria-label="Semana anterior"
            />
            <VStack spacing={0}>
              <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'lg' }} textAlign="center">
                {inicioSemana.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - {fimSemana.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </Text>
              {!isMobile && (
                <Text fontSize="sm" color={mutedTextColor}>
                  {inicioSemana.toLocaleDateString('pt-BR', { year: 'numeric' })}
                </Text>
              )}
            </VStack>
            <IconButton
              onClick={() => navegarSemana('proxima')} 
              variant="outline"
              size={{ base: 'sm', md: 'md' }}
              icon={<Text>→</Text>}
              aria-label="Próxima semana"
            />
          </Flex>
        </VStack>

        {/* Calendário Semanal */}
        <Box bg={bgColor} borderRadius="lg" shadow="sm" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
          {/* Cabeçalho dos Dias */}
          <Grid 
            templateColumns={calendarColumns} 
            gap={0} 
            borderBottom="1px" 
            borderColor={borderColor}
          >
            <GridItem p={{ base: 1, md: 3 }} bg={headerBg} borderRight="1px" borderColor={borderColor}>
              <Text fontWeight="bold" fontSize={{ base: 'xs', md: 'sm' }} color={mutedTextColor}>
                {isMobile ? 'H' : 'Horário'}
              </Text>
            </GridItem>
            {diasSemana.map((dia, index) => (
              <GridItem key={index} p={{ base: 1, md: 3 }} bg={headerBg} borderRight="1px" borderColor={borderColor}>
                <VStack spacing={0}>
                  <Text fontWeight="bold" fontSize={{ base: '2xs', md: 'sm' }} color={textColor}>
                    {isMobile ? DIAS_SEMANA[dia.getDay()].substring(0, 1) : DIAS_SEMANA[dia.getDay()]}
                  </Text>
                  <Text fontSize={{ base: '2xs', md: 'xs' }} color={mutedTextColor}>
                    {dia.getDate()}/{dia.getMonth() + 1}
                  </Text>
                </VStack>
              </GridItem>
            ))}
          </Grid>

          {/* Grade de Horários */}
          {HORARIOS_FUNCIONAMENTO.map((hora) => (
            <Grid 
              key={hora} 
              templateColumns={calendarColumns} 
              gap={0} 
              borderBottom="1px" 
              borderColor={lightBorderColor}
            >
              <GridItem p={{ base: 1, md: 3 }} bg={headerBg} borderRight="1px" borderColor={borderColor}>
                <Text fontSize={{ base: '2xs', md: 'sm' }} fontWeight="medium" color={textColor}>
                  {isMobile ? hora.substring(0, 2) : hora}
                </Text>
              </GridItem>
              {diasSemana.map((dia, diaIndex) => {
                const eventosDaHora = getTodosEventosPorDiaHora(dia, hora);
                return (
                  <GridItem 
                    key={diaIndex} 
                    p={{ base: 0.5, md: 1 }} 
                    borderRight="1px" 
                    borderColor={borderColor}
                    minH={{ base: "60px", md: "60px" }}
                    bg={eventosDaHora.length > 0 ? cellWithAgendamentoBg : cellBg}
                  >
                    <VStack spacing={{ base: 0.5, md: 1 }} h="full">
                      {eventosDaHora.map((evento) => {
                        // Type guard para agendamentos
                        if ('cliente_nome' in evento && 'status' in evento) {
                          return (
                            <Card
                              key={evento.id}
                              size="sm"
                              w="full"
                              bg={`${getStatusColor(evento.status)}.100`}
                              borderLeft="2px solid"
                              borderLeftColor={`${getStatusColor(evento.status)}.500`}
                              cursor="pointer"
                              onClick={() => isMobile ? (() => {
                                setAgendamentoSelecionado(evento);
                                onActionsOpen();
                              })() : undefined}
                              _hover={isMobile ? { 
                                bg: `${getStatusColor(evento.status)}.200`,
                                transform: 'scale(1.02)'
                              } : {}}
                              transition="all 0.2s"
                            >
                              <CardBody p={{ base: 1.5, md: 2 }}>
                                {isMobile ? (
                                  // Layout ultra-simplificado para mobile
                                  <VStack spacing={1} align="flex-start" w="full">
                                    <Text 
                                      fontSize="xs" 
                                      fontWeight="bold" 
                                      noOfLines={1} 
                                      color={textColor}
                                      w="full"
                                    >
                                      {evento.cliente_nome}
                                    </Text>
                                    <HStack justify="space-between" w="full">
                                      <Badge 
                                        size="xs" 
                                        colorScheme={getStatusColor(evento.status)}
                                        variant="solid"
                                      >
                                        {evento.status === 'AGENDADO' ? 'A' : 
                                         evento.status === 'CONFIRMADO' ? 'C' : 
                                         evento.status === 'REALIZADO' ? 'R' : 'X'}
                                      </Badge>
                                      {evento.horario_fim && (
                                        <Text fontSize="2xs" color={mutedTextColor}>
                                          {evento.horario.substring(0, 2)}-{evento.horario_fim.substring(0, 2)}
                                        </Text>
                                      )}
                                    </HStack>
                                    {(evento.servicos && evento.servicos.length > 0) || evento.servico ? (
                                      <Text fontSize="2xs" color={mutedTextColor} noOfLines={1} w="full">
                                        {evento.servicos && evento.servicos.length > 0 
                                          ? evento.servicos[0].servico?.nome || 'Serviço'
                                          : evento.servico?.nome || 'Serviço'
                                        }
                                        {evento.servicos && evento.servicos.length > 1 && ` +${evento.servicos.length - 1}`}
                                      </Text>
                                    ) : null}
                                  </VStack>
                                ) : (
                                  // Layout completo para desktop
                                  <VStack spacing={1} align="flex-start">
                                    <Text fontSize="xs" fontWeight="bold" noOfLines={1} color={textColor}>
                                      {evento.cliente_nome}
                                    </Text>
                                    
                                    {/* Múltiplos Serviços */}
                                    {evento.servicos && evento.servicos.length > 0 ? (
                                      <Box>
                                        {evento.servicos.slice(0, 2).map((agendServ: any, index: number) => (
                                          <Text key={index} fontSize="xs" color={mutedTextColor} noOfLines={1}>
                                            {index === 0 ? '🎯' : '+'} {agendServ.servico?.nome}
                                          </Text>
                                        ))}
                                        {evento.servicos.length > 2 && (
                                          <Text fontSize="xs" color="blue.500">
                                            +{evento.servicos.length - 2} serviços
                                          </Text>
                                        )}
                                      </Box>
                                    ) : (
                                      <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
                                        {evento.servico?.nome || 'Serviço'}
                                      </Text>
                                    )}
                                    
                                    {evento.horario_fim && (
                                      <Text fontSize="xs" color="blue.500" noOfLines={1}>
                                        ⏰ {evento.horario.substring(0, 5)} - {evento.horario_fim.substring(0, 5)}
                                      </Text>
                                    )}
                                    
                                    {/* Múltiplos Funcionários */}
                                    <HStack spacing={1} flexWrap="wrap">
                                      {evento.funcionarios && evento.funcionarios.length > 0 ? (
                                        evento.funcionarios.slice(0, 2).map((agendFunc: any, index: number) => (
                                          <HStack key={index} spacing={1}>
                                            <Avatar 
                                              size="2xs" 
                                              name={`${agendFunc.funcionario?.nome} ${agendFunc.funcionario?.sobrenome}`}
                                              bg={agendFunc.responsavel_principal ? "rosa.400" : "gray.400"}
                                            />
                                            <Text fontSize="xs" color={mutedTextColor}>
                                              {agendFunc.funcionario?.nome}
                                              {agendFunc.responsavel_principal && ' 👑'}
                                            </Text>
                                          </HStack>
                                        ))
                                      ) : evento.funcionario ? (
                                        <HStack spacing={1}>
                                          <Avatar 
                                            size="2xs" 
                                            name={`${evento.funcionario?.nome} ${evento.funcionario?.sobrenome}`}
                                            bg="rosa.400"
                                          />
                                          <Text fontSize="xs" color={mutedTextColor}>
                                            {evento.funcionario?.nome}
                                          </Text>
                                        </HStack>
                                      ) : (
                                        <Text fontSize="xs" color={mutedTextColor} fontStyle="italic">
                                          Sem funcionário
                                        </Text>
                                      )}
                                      {evento.funcionarios && evento.funcionarios.length > 2 && (
                                        <Text fontSize="xs" color="blue.500">
                                          +{evento.funcionarios.length - 2}
                                        </Text>
                                      )}
                                    </HStack>
                                    <HStack justify="space-between" w="full">
                                      <Badge size="xs" colorScheme={getStatusColor(evento.status)}>
                                        {getStatusLabel(evento.status)}
                                      </Badge>
                                      <Menu>
                                        <MenuButton
                                          as={IconButton}
                                          icon={<ChevronDownIcon />}
                                          size="xs"
                                          variant="ghost"
                                        />
                                        <MenuList fontSize="sm">
                                          <MenuItem onClick={() => handleAlterarStatus(evento.id, 'AGENDADO')}>
                                            Marcar como Agendado
                                          </MenuItem>
                                          <MenuItem onClick={() => handleAlterarStatus(evento.id, 'CONFIRMADO')}>
                                            Marcar como Confirmado
                                          </MenuItem>
                                          <MenuItem onClick={() => handleAlterarStatus(evento.id, 'REALIZADO')}>
                                            Marcar como Realizado
                                          </MenuItem>
                                          <MenuItem onClick={() => handleAlterarStatus(evento.id, 'CANCELADO')}>
                                            Cancelar
                                          </MenuItem>
                                          <MenuItem 
                                            onClick={() => handleExcluirAgendamento(evento.id)}
                                            color="red.500"
                                            _hover={{ bg: 'red.50' }}
                                          >
                                            Excluir Agendamento
                                          </MenuItem>
                                        </MenuList>
                                      </Menu>
                                    </HStack>
                                  </VStack>
                                )}
                              </CardBody>
                            </Card>
                          );
                        }
                        
                        // Type guard para eventos do Google Calendar
                        if ('titulo' in evento) {
                          return (
                            <Card
                              key={evento.id}
                              size="sm"
                              w="full"
                              bg="blue.100"
                              borderLeft="2px solid"
                              borderLeftColor="blue.500"
                              cursor={isMobile ? "pointer" : "default"}
                              onClick={() => isMobile ? toast({
                                title: "Evento Google Calendar",
                                description: evento.titulo,
                                status: "info",
                                duration: 3000,
                                isClosable: true,
                              }) : undefined}
                              _hover={isMobile ? { 
                                bg: "blue.200",
                                transform: 'scale(1.02)'
                              } : {}}
                              transition="all 0.2s"
                            >
                              <CardBody p={{ base: 1.5, md: 2 }}>
                                {isMobile ? (
                                  <VStack spacing={1} align="flex-start" w="full">
                                    <Text fontSize="xs" fontWeight="bold" noOfLines={1} color={textColor} w="full">
                                      {evento.titulo.length > 10 ? evento.titulo.substring(0, 10) + '...' : evento.titulo}
                                    </Text>
                                    <Badge size="xs" colorScheme="blue" variant="solid">
                                      G
                                    </Badge>
                                  </VStack>
                                ) : (
                                  <VStack spacing={1} align="flex-start">
                                    <Text fontSize="xs" fontWeight="bold" noOfLines={1} color={textColor}>
                                      {evento.titulo}
                                    </Text>
                                    <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
                                      📅 Google Calendar
                                    </Text>
                                    <Badge size="xs" colorScheme="blue">
                                      Evento Externo
                                    </Badge>
                                  </VStack>
                                )}
                              </CardBody>
                            </Card>
                          );
                        }
                        return null;
                      })}
                    </VStack>
                  </GridItem>
                );
              })}
            </Grid>
          ))}
        </Box>

        {/* Resumo da Semana */}
        <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} spacing={{ base: 3, md: 4 }}>
          <Card bg="white" shadow="sm">
            <CardBody p={{ base: 4, md: 6 }}>
              <VStack spacing={{ base: 2, md: 3 }}>
                <CalendarIcon color="blue.500" />
                <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="blue.500">
                  {agendamentos.length}
                </Text>
                <Text fontSize="sm" color="gray.600">Total de Agendamentos</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="white" shadow="sm">
            <CardBody>
              <VStack>
                <CalendarIcon color="green.500" />
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {agendamentos.filter(a => a.status === 'CONFIRMADO').length}
                </Text>
                <Text fontSize="sm" color="gray.600">Confirmados</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="white" shadow="sm">
            <CardBody>
              <VStack>
                <CalendarIcon color="purple.500" />
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {agendamentos.filter(a => a.status === 'REALIZADO').length}
                </Text>
                <Text fontSize="sm" color="gray.600">Realizados</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg="white" shadow="sm">
            <CardBody>
              <VStack>
                <CalendarIcon color="red.500" />
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {agendamentos.filter(a => a.status === 'CANCELADO').length}
                </Text>
                <Text fontSize="sm" color="gray.600">Cancelados</Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>

      {/* Modal de Ações do Agendamento (Mobile) */}
      {agendamentoSelecionado && (
        <Modal isOpen={isActionsOpen} onClose={onActionsClose} size="sm">
          <ModalOverlay />
          <ModalContent mx={4}>
            <ModalHeader pb={2}>
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="bold">
                  {agendamentoSelecionado.cliente_nome}
                </Text>
                <HStack spacing={2}>
                  <Badge colorScheme={getStatusColor(agendamentoSelecionado.status)}>
                    {getStatusLabel(agendamentoSelecionado.status)}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    {agendamentoSelecionado.horario.substring(0, 5)}
                    {agendamentoSelecionado.horario_fim && ` - ${agendamentoSelecionado.horario_fim.substring(0, 5)}`}
                  </Text>
                </HStack>
                {/* Mostrar serviço(s) */}
                {agendamentoSelecionado.servicos && agendamentoSelecionado.servicos.length > 0 ? (
                  <Text fontSize="sm" color="gray.600">
                    {agendamentoSelecionado.servicos.map(s => s.servico?.nome).join(', ')}
                  </Text>
                ) : (
                  <Text fontSize="sm" color="gray.600">
                    {agendamentoSelecionado.servico?.nome || 'Serviço'}
                  </Text>
                )}
              </VStack>
            </ModalHeader>
            <ModalCloseButton />
            
            <ModalBody pb={6}>
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Alterar status:
                </Text>
                
                <Button
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => {
                    handleAlterarStatus(agendamentoSelecionado.id, 'AGENDADO');
                    onActionsClose();
                  }}
                  isDisabled={agendamentoSelecionado.status === 'AGENDADO'}
                >
                  ✓ Marcar como Agendado
                </Button>
                
                <Button
                  variant="outline"
                  colorScheme="green"
                  onClick={() => {
                    handleAlterarStatus(agendamentoSelecionado.id, 'CONFIRMADO');
                    onActionsClose();
                  }}
                  isDisabled={agendamentoSelecionado.status === 'CONFIRMADO'}
                >
                  ✓ Marcar como Confirmado
                </Button>
                
                <Button
                  variant="outline"
                  colorScheme="purple"
                  onClick={() => {
                    handleAlterarStatus(agendamentoSelecionado.id, 'REALIZADO');
                    onActionsClose();
                  }}
                  isDisabled={agendamentoSelecionado.status === 'REALIZADO'}
                >
                  ✓ Marcar como Realizado
                </Button>
                
                <Button
                  variant="outline"
                  colorScheme="orange"
                  onClick={() => {
                    handleAlterarStatus(agendamentoSelecionado.id, 'CANCELADO');
                    onActionsClose();
                  }}
                  isDisabled={agendamentoSelecionado.status === 'CANCELADO'}
                >
                  ✗ Cancelar Agendamento
                </Button>
                
                <Divider />
                
                <Button
                  variant="outline"
                  colorScheme="red"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
                      handleExcluirAgendamento(agendamentoSelecionado.id);
                      onActionsClose();
                    }
                  }}
                >
                  🗑️ Excluir Agendamento
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de Novo Agendamento */}
      <AgendamentoFormModal
        isOpen={isFormOpen}
        onClose={onFormClose}
        funcionarios={funcionarios}
        servicos={servicos}
        onSave={handleSalvarAgendamento}
      />

      {/* Modal de Configuração do Google Calendar */}
      <GoogleCalendarConfigModal 
        isOpen={isGoogleConfigOpen} 
        onClose={handleGoogleConfigClose} 
      />
    </Box>
  );
};