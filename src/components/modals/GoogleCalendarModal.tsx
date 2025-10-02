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
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  HStack,
  Icon,
  Badge,
  Divider,
  Code,
  OrderedList,
  ListItem
} from '@chakra-ui/react';
import { FaGoogle, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { googleCalendarService } from '../../services/googleCalendar';
import { isGoogleCalendarConfigured } from '../../config/googleCalendar';

interface GoogleCalendarConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleCalendarConfigModal: React.FC<GoogleCalendarConfigModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [configStatus, setConfigStatus] = useState<'checking' | 'configured' | 'missing'>('checking');

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = () => {
    setConfigStatus(isGoogleCalendarConfigured() ? 'configured' : 'missing');
    setIsConnected(googleCalendarService.isConnected());
  };

  const handleConnect = () => {
    if (configStatus !== 'configured') {
      return;
    }

    setIsConnecting(true);
    const authUrl = googleCalendarService.getAuthUrl();
    
    // Abrir popup para autenticação
    const popup = window.open(
      authUrl,
      'google-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // Monitorar o popup
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setIsConnecting(false);
        checkStatus();
      }
    }, 1000);
  };

  const handleDisconnect = () => {
    googleCalendarService.disconnect();
    setIsConnected(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={FaGoogle} color="red.500" />
            <Text>Integração Google Calendar</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Status da Configuração */}
            <Box>
              <Text fontWeight="bold" mb={3}>Status da Configuração:</Text>
              {configStatus === 'checking' && (
                <Alert status="info">
                  <AlertIcon />
                  <AlertTitle>Verificando configuração...</AlertTitle>
                </Alert>
              )}
              
              {configStatus === 'missing' && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertTitle>Configuração Necessária</AlertTitle>
                  <AlertDescription>
                    As credenciais do Google Calendar não foram configuradas.
                  </AlertDescription>
                </Alert>
              )}
              
              {configStatus === 'configured' && (
                <Alert status="success">
                  <AlertIcon />
                  <AlertTitle>Configuração Completa</AlertTitle>
                  <AlertDescription>
                    As credenciais do Google Calendar estão configuradas.
                  </AlertDescription>
                </Alert>
              )}
            </Box>

            {/* Status da Conexão */}
            <Box>
              <Text fontWeight="bold" mb={3}>Status da Conexão:</Text>
              <HStack>
                <Icon 
                  as={isConnected ? FaCheckCircle : FaExclamationTriangle} 
                  color={isConnected ? 'green.500' : 'orange.500'} 
                />
                <Text>{isConnected ? 'Conectado' : 'Desconectado'}</Text>
                <Badge colorScheme={isConnected ? 'green' : 'orange'}>
                  {isConnected ? 'ATIVO' : 'INATIVO'}
                </Badge>
              </HStack>
            </Box>

            {/* Funcionalidades */}
            <Box>
              <Text fontWeight="bold" mb={3}>Funcionalidades:</Text>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={FaCalendarAlt} color="blue.500" />
                  <Text>Criação automática de eventos</Text>
                </HStack>
                <HStack>
                  <Icon as={FaCalendarAlt} color="blue.500" />
                  <Text>Sincronização de alterações</Text>
                </HStack>
                <HStack>
                  <Icon as={FaCalendarAlt} color="blue.500" />
                  <Text>Remoção automática de cancelamentos</Text>
                </HStack>
                <HStack>
                  <Icon as={FaCalendarAlt} color="blue.500" />
                  <Text>Lembretes por email e popup</Text>
                </HStack>
              </VStack>
            </Box>

            {/* Instruções de Configuração */}
            {configStatus === 'missing' && (
              <>
                <Divider />
                <Box>
                  <Text fontWeight="bold" mb={3} color="red.500">📋 Configuração Necessária:</Text>
                  <Alert status="warning" mb={4}>
                    <AlertIcon />
                    <AlertDescription>
                      Para usar a integração com Google Calendar, você precisa configurar as credenciais primeiro.
                    </AlertDescription>
                  </Alert>
                  
                  <Text fontWeight="semibold" mb={2}>Passos para configurar:</Text>
                  <OrderedList spacing={2} fontSize="sm">
                    <ListItem>
                      Acesse o <Code>Google Cloud Console</Code>
                    </ListItem>
                    <ListItem>
                      Crie ou selecione um projeto
                    </ListItem>
                    <ListItem>
                      Ative a <Code>Google Calendar API</Code>
                    </ListItem>
                    <ListItem>
                      Crie credenciais OAuth 2.0
                    </ListItem>
                    <ListItem>
                      Configure as variáveis de ambiente:
                      <Box ml={4} mt={2}>
                        <Code display="block" p={2} bg="gray.100">
                          VITE_GOOGLE_CLIENT_ID=seu_client_id<br/>
                          VITE_GOOGLE_CLIENT_SECRET=seu_client_secret<br/>
                          VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
                        </Code>
                      </Box>
                    </ListItem>
                    <ListItem>
                      Reinicie a aplicação
                    </ListItem>
                  </OrderedList>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
            
            {configStatus === 'configured' && (
              <>
                {!isConnected ? (
                  <Button
                    colorScheme="red"
                    onClick={handleConnect}
                    isLoading={isConnecting}
                    loadingText="Conectando..."
                    leftIcon={<FaGoogle />}
                  >
                    Conectar Google Calendar
                  </Button>
                ) : (
                  <Button
                    colorScheme="gray"
                    onClick={handleDisconnect}
                    leftIcon={<FaGoogle />}
                  >
                    Desconectar
                  </Button>
                )}
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};