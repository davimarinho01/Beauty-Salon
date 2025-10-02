import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Divider,
  Link,
  useToast
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { googleCalendarService } from '../../services/googleCalendar';
import { isGoogleCalendarConfigured } from '../../config/googleCalendar';

interface GoogleCalendarConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleCalendarConfigModal = ({ isOpen, onClose }: GoogleCalendarConfigModalProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ synced: number; unsynced: number; total: number } | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setIsConnected(googleCalendarService.isConnected());
      
      // Carregar status de sincronização se conectado
      if (googleCalendarService.isConnected()) {
        loadSyncStatus();
      }
    }

    // Escutar mensagens do popup de autenticação
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.code) {
        await handleAuthCallback(event.data.code);
        loadSyncStatus(); // Carregar status após conectar
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        toast({
          title: 'Erro na autenticação',
          description: event.data.error || 'Erro desconhecido',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen]);

  const loadSyncStatus = async () => {
    try {
      const status = await googleCalendarService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Erro ao carregar status de sincronização:', error);
    }
  };

  const handleAuthCallback = async (code: string) => {
    setIsLoading(true);
    try {
      const success = await googleCalendarService.handleAuthCallback(code);
      if (success) {
        setIsConnected(true);
        toast({
          title: 'Conectado com sucesso!',
          description: 'Google Calendar configurado e conectado.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Falha na autenticação');
      }
    } catch (error) {
      console.error('Erro no callback de autenticação:', error);
      toast({
        title: 'Erro na autenticação',
        description: 'Não foi possível conectar com o Google Calendar.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    if (!isGoogleCalendarConfigured()) {
      toast({
        title: 'Configuração necessária',
        description: 'Configure as credenciais do Google Calendar no arquivo .env',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const authUrl = googleCalendarService.getAuthUrl();
    
    // Usar uma nova aba em vez de popup para evitar problemas de COOP
    const popup = window.open(authUrl, '_blank');
    
    if (!popup) {
      toast({
        title: 'Popup bloqueado',
        description: 'Por favor, permita popups para este site e tente novamente.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Escutar mensagens de autorização concluída
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return; // Ignorar mensagens de outras origens
      }
      
      if (event.data?.type === 'GOOGLE_AUTH_COMPLETED') {
        window.removeEventListener('message', handleMessage);
        setIsConnected(googleCalendarService.isConnected());
        
        if (event.data.success) {
          toast({
            title: 'Conectado!',
            description: 'Google Calendar foi conectado com sucesso.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Erro na conexão',
            description: 'Não foi possível conectar ao Google Calendar.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Fallback: verificar status após 30 segundos
    setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      setIsConnected(googleCalendarService.isConnected());
    }, 30000);
  };

  const handleDisconnect = () => {
    googleCalendarService.disconnect();
    setIsConnected(false);
    toast({
      title: 'Desconectado',
      description: 'Google Calendar foi desconectado.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Configurar Google Calendar</Text>
            <Badge colorScheme={isConnected ? 'green' : 'gray'}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {!isGoogleCalendarConfigured() && (
              <Alert status="warning">
                <AlertIcon />
                <Box>
                  <AlertTitle>Configuração necessária!</AlertTitle>
                  <AlertDescription>
                    Configure as credenciais do Google Calendar no arquivo .env:
                    <br />
                    - VITE_GOOGLE_CLIENT_ID
                    <br />
                    - VITE_GOOGLE_CLIENT_SECRET
                    <br />
                    - VITE_GOOGLE_REDIRECT_URI
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {isConnected ? (
              <>
                <Alert status="success">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Google Calendar conectado!</AlertTitle>
                    <AlertDescription>
                      Os agendamentos serão sincronizados automaticamente com seu Google Calendar.
                    </AlertDescription>
                  </Box>
                </Alert>

                {syncStatus && (
                  <Alert status={syncStatus.unsynced > 0 ? 'warning' : 'success'}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Status de Sincronização</AlertTitle>
                      <AlertDescription>
                        <Text fontSize="sm">
                          <strong>{syncStatus.synced}</strong> de <strong>{syncStatus.total}</strong> agendamentos sincronizados
                        </Text>
                        {syncStatus.unsynced > 0 && (
                          <Text fontSize="sm" color="orange.600" mt={1}>
                            {syncStatus.unsynced} agendamentos não sincronizados. Use o botão "Sincronizar" na página de agendamentos.
                          </Text>
                        )}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </>
            ) : (
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Conectar ao Google Calendar</AlertTitle>
                  <AlertDescription>
                    Conecte sua conta do Google para sincronizar os agendamentos automaticamente.
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>Como funciona:</Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm">• Agendamentos criados são adicionados ao seu calendário</Text>
                <Text fontSize="sm">• Alterações são sincronizadas automaticamente</Text>
                <Text fontSize="sm">• Status dos agendamentos são refletidos por cores</Text>
                <Text fontSize="sm">• Lembretes são configurados automaticamente</Text>
              </VStack>
            </Box>

            <Divider />

            <Box>
              <Text fontSize="sm" color="gray.600">
                <strong>Importante:</strong> Configure estas URLs de redirecionamento no Google Cloud Console:
              </Text>
              <VStack align="start" spacing={1} mt={2}>
                <Text fontSize="xs" fontFamily="mono" bg="gray.100" px={2} py={1} borderRadius="md">
                  http://localhost:3000/auth/google/callback
                </Text>
                <Text fontSize="xs" fontFamily="mono" bg="gray.100" px={2} py={1} borderRadius="md">
                  http://localhost:3001/auth/google/callback
                </Text>
                <Text fontSize="xs" fontFamily="mono" bg="gray.100" px={2} py={1} borderRadius="md">
                  http://localhost:3002/auth/google/callback
                </Text>
              </VStack>
              <Text fontSize="xs" color="gray.500" mt={2}>
                Configure todas as 3 URLs para evitar erros quando a porta mudar.
              </Text>
            </Box>

            <Box>
              <Text fontSize="xs" color="gray.500">
                Precisa de ajuda? Consulte a{' '}
                <Link 
                  href="https://developers.google.com/calendar/api/quickstart/js" 
                  isExternal 
                  color="blue.500"
                >
                  documentação do Google Calendar API
                </Link>
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
            {isConnected ? (
              <Button colorScheme="red" onClick={handleDisconnect}>
                Desconectar
              </Button>
            ) : (
              <Button 
                colorScheme="blue" 
                onClick={handleConnect}
                isLoading={isLoading}
                loadingText="Conectando..."
                isDisabled={!isGoogleCalendarConfigured()}
              >
                Conectar Google Calendar
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};