import { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Spinner
} from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { googleCalendarService } from '../services/googleCalendar';

export const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Processando...');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      try {
        if (error) {
          setStatus('Erro na autenticação');
          
          // Enviar mensagem de erro para a janela pai
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_COMPLETED',
              success: false,
              error: error
            }, window.location.origin);
            
            setTimeout(() => window.close(), 2000);
          } else {
            setTimeout(() => {
              window.location.href = '/agendamento';
            }, 2000);
          }
          return;
        }

        if (code) {
          setStatus('Finalizando autenticação...');
          
          // Processar o código de autorização
          const success = await googleCalendarService.handleAuthCallback(code);
          
          if (success) {
            setStatus('Autenticação concluída!');
            
            // Enviar mensagem de sucesso para a janela pai
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_COMPLETED',
                success: true
              }, window.location.origin);
              
              setTimeout(() => window.close(), 1000);
            } else {
              setTimeout(() => {
                window.location.href = '/agendamento';
              }, 2000);
            }
          } else {
            throw new Error('Falha ao processar autenticação');
          }
        } else {
          throw new Error('Código de autorização não encontrado');
        }
      } catch (err) {
        console.error('Erro no callback:', err);
        setStatus('Erro ao processar autenticação');
        
        // Enviar mensagem de erro
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_COMPLETED',
            success: false,
            error: err instanceof Error ? err.message : 'Erro desconhecido'
          }, window.location.origin);
          
          setTimeout(() => window.close(), 2000);
        } else {
          setTimeout(() => {
            window.location.href = '/agendamento';
          }, 2000);
        }
      }
    };

    processCallback();
  }, [searchParams]);

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg="gray.50"
    >
      <VStack spacing={6} maxW="md" textAlign="center">
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text fontSize="lg" fontWeight="medium">
          {status}
        </Text>
        <Text color="gray.600">
          Esta janela será fechada automaticamente.
        </Text>
      </VStack>
    </Box>
  );
};