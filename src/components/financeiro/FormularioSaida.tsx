import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Icon,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react'
import { TrendingDown, Save } from 'lucide-react'
import { useState } from 'react'
import type { FormularioSaida as FormSaida } from '../../types'

interface Props {
  onSuccess: (saida: FormSaida) => Promise<void>
}

export const FormularioSaida = ({ onSuccess }: Props) => {
  const [loading, setLoading] = useState(false)
  
  const [formulario, setFormulario] = useState<FormSaida>({
    tipo_saida: '',
    valor: 0,
    descricao: ''
  })

  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formulario.tipo_saida || !formulario.descricao || formulario.valor <= 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    try {
      await onSuccess(formulario)
      
      // Limpar formulário
      setFormulario({
        tipo_saida: '',
        valor: 0,
        descricao: ''
      })

      toast({
        title: 'Saída registrada!',
        description: 'Movimentação criada com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao registrar saída',
        description: 'Tente novamente em alguns instantes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <HStack spacing={3}>
              <Icon as={TrendingDown} w={5} h={5} color="red.500" />
              <Text fontSize="lg" fontWeight="semibold" color="neutral.800">
                Registrar Nova Saída
              </Text>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Tipo da Saída</FormLabel>
                <Input
                  value={formulario.tipo_saida}
                  onChange={(e) => setFormulario(prev => ({ ...prev, tipo_saida: e.target.value }))}
                  placeholder="Ex: Produtos, Equipamentos, Salário..."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Valor</FormLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formulario.valor}
                  onChange={(e) => setFormulario(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                  placeholder="0,00"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired>
              <FormLabel>Descrição</FormLabel>
              <Textarea
                value={formulario.descricao}
                onChange={(e) => setFormulario(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva detalhadamente a saída..."
                rows={4}
              />
            </FormControl>

            <HStack justify="flex-end" spacing={3}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormulario({
                  tipo_saida: '',
                  valor: 0,
                  descricao: ''
                })}
              >
                Limpar
              </Button>
              <Button
                type="submit"
                colorScheme="red"
                leftIcon={<Icon as={Save} />}
                isLoading={loading}
                loadingText="Salvando..."
              >
                Registrar Saída
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  )
}