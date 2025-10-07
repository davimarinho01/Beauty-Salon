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
  useColorModeValue
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
}

interface Servico {
  id: string;
  nome: string;
  valor_base: number;
}

interface Agendamento {
  id: string;
  servico_id: string;
  funcionario_id: string;
  cliente_nome: string;
  cliente_telefone?: string;
  data_agendamento: string;
  horario: string;
  status: 'AGENDADO' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO';
  observacoes?: string;
  funcionario?: Funcionario;
  servico?: Servico;
}

const HORARIOS_FUNCIONAMENTO = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
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
  const toast = useToast();

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

  const getAgendamentosPorDiaHora = (dia: Date, hora: string) => {
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

    return agendamentosDoDia;
  };

  const getEventosGooglePorDiaHora = (dia: Date, hora: string) => {
    const dataStr = dia.toISOString().split('T')[0];
    
    return eventosGoogle.filter(evento => {
      const dataInicio = new Date(evento.data_inicio);
      const dataInicioStr = dataInicio.toISOString().split('T')[0];
      const horarioEvento = dataInicio.toTimeString().substring(0, 5);
      const horaComparação = hora.substring(0, 5);
      
      return dataInicioStr === dataStr && horarioEvento === horaComparação;
    });
  };

  const getTodosEventosPorDiaHora = (dia: Date, hora: string): (Agendamento | EventoGoogle)[] => {
    const agendamentosHora = getAgendamentosPorDiaHora(dia, hora);
    const eventosHora = getEventosGooglePorDiaHora(dia, hora);
    
    return [...agendamentosHora, ...eventosHora];
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
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Cabeçalho */}
        <HStack justify="space-between" align="center">
          <Heading size="lg" color={headingColor}>
            Agenda da Semana
          </Heading>
          <HStack spacing={3}>
            <Select
              placeholder="Todos os funcionários"
              value={funcionarioFiltro}
              onChange={(e) => setFuncionarioFiltro(e.target.value)}
              maxW="300px"
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
            >
              Novo Agendamento
            </Button>
            <Button
              leftIcon={<FaGoogle />}
              colorScheme={isGoogleConnected ? "green" : "red"}
              variant={isGoogleConnected ? "solid" : "outline"}
              onClick={onGoogleConfigOpen}
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
                loadingText="Sincronizando..."
                size="sm"
              >
                Sincronizar Exclusões
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Navegação da Semana */}
        <HStack justify="center" spacing={4}>
          <Button onClick={() => navegarSemana('anterior')} variant="outline">
            ← Semana Anterior
          </Button>
          <Text fontWeight="bold" fontSize="lg">
            {inicioSemana.toLocaleDateString()} - {fimSemana.toLocaleDateString()}
          </Text>
          <Button onClick={() => navegarSemana('proxima')} variant="outline">
            Próxima Semana →
          </Button>
        </HStack>

        {/* Calendário Semanal */}
        <Box bg={bgColor} borderRadius="lg" shadow="sm" overflow="hidden" borderWidth="1px" borderColor={borderColor}>
          {/* Cabeçalho dos Dias */}
          <Grid templateColumns={`100px repeat(7, 1fr)`} gap={0} borderBottom="1px" borderColor={borderColor}>
            <GridItem p={3} bg={headerBg} borderRight="1px" borderColor={borderColor}>
              <Text fontWeight="bold" fontSize="sm" color={mutedTextColor}>
                Horário
              </Text>
            </GridItem>
            {diasSemana.map((dia, index) => (
              <GridItem key={index} p={3} bg={headerBg} borderRight="1px" borderColor={borderColor}>
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="sm" color={textColor}>
                    {DIAS_SEMANA[dia.getDay()]}
                  </Text>
                  <Text fontSize="xs" color={mutedTextColor}>
                    {dia.getDate()}/{dia.getMonth() + 1}
                  </Text>
                </VStack>
              </GridItem>
            ))}
          </Grid>

          {/* Grade de Horários */}
          {HORARIOS_FUNCIONAMENTO.map((hora) => (
            <Grid key={hora} templateColumns={`100px repeat(7, 1fr)`} gap={0} borderBottom="1px" borderColor={lightBorderColor}>
              <GridItem p={3} bg={headerBg} borderRight="1px" borderColor={borderColor}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  {hora}
                </Text>
              </GridItem>
              {diasSemana.map((dia, diaIndex) => {
                const eventosDaHora = getTodosEventosPorDiaHora(dia, hora);
                return (
                  <GridItem 
                    key={diaIndex} 
                    p={1} 
                    borderRight="1px" 
                    borderColor={borderColor}
                    minH="60px"
                    bg={eventosDaHora.length > 0 ? cellWithAgendamentoBg : cellBg}
                  >
                    <VStack spacing={1} h="full">
                      {eventosDaHora.map((evento) => {
  if ('cliente_nome' in evento && 'status' in evento) {
    return (
      <Card
        key={evento.id}
        size="sm"
        w="full"
        bg={`${getStatusColor(evento.status)}.50`}
        borderLeft="3px solid"
        borderLeftColor={`${getStatusColor(evento.status)}.400`}
      >
        <CardBody p={2}>
          <VStack spacing={1} align="flex-start">
            <Text fontSize="xs" fontWeight="bold" noOfLines={1} color={textColor}>
              {evento.cliente_nome}
            </Text>
            <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
              {evento.servico?.nome || 'Serviço'}
            </Text>
            <HStack spacing={1}>
              {evento.funcionario ? (
                <>
                  <Avatar 
                    size="2xs" 
                    name={`${evento.funcionario?.nome} ${evento.funcionario?.sobrenome}`}
                    bg="rosa.400"
                  />
                  <Text fontSize="xs" color={mutedTextColor}>
                    {evento.funcionario?.nome}
                  </Text>
                </>
              ) : (
                <Text fontSize="xs" color={mutedTextColor} fontStyle="italic">
                  Sem funcionário
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
                <MenuList>
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
                    Marcar como Cancelado
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
        </CardBody>
      </Card>
    );
  } else if ('titulo' in evento && 'google_event_id' in evento) {
    return (
      <Card
        key={evento.id}
        size="sm"
        w="full"
        bg="blue.50"
        borderLeft="3px solid"
        borderLeftColor="blue.400"
      >
        <CardBody p={2}>
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
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg="white" shadow="sm">
            <CardBody>
              <VStack>
                <CalendarIcon color="blue.500" />
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
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