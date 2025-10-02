import { supabase } from './supabase'

// Serviço para operações gerais do banco de dados
export const databaseService = {
  // Resetar todos os dados do banco
  async resetAllData(): Promise<void> {
    try {
      console.log('🗑️ Iniciando reset do banco de dados...')
      
      // Para UUIDs, precisamos buscar todos os registros e deletar
      // Deletar em ordem para respeitar foreign keys
      
      // 1. Agendamentos (referenciam funcionarios e servicos)
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('id')
      
      if (agendamentos && agendamentos.length > 0) {
        const { error: agendamentosError } = await supabase
          .from('agendamentos')
          .delete()
          .in('id', agendamentos.map(item => item.id))
        
        if (agendamentosError) {
          console.error('Erro ao deletar agendamentos:', agendamentosError)
          throw agendamentosError
        }
      }
      console.log('✅ Agendamentos deletados')
      
      // 2. Movimentações financeiras (referenciam funcionarios e servicos)
      const { data: movimentacoes } = await supabase
        .from('movimentacoes_financeiras')
        .select('id')
      
      if (movimentacoes && movimentacoes.length > 0) {
        const { error: movimentacoesError } = await supabase
          .from('movimentacoes_financeiras')
          .delete()
          .in('id', movimentacoes.map(item => item.id))
        
        if (movimentacoesError) {
          console.error('Erro ao deletar movimentações:', movimentacoesError)
          throw movimentacoesError
        }
      }
      console.log('✅ Movimentações deletadas')
      
      // 3. Serviços (referenciam funcionarios)
      const { data: servicos } = await supabase
        .from('servicos')
        .select('id')
      
      if (servicos && servicos.length > 0) {
        const { error: servicosError } = await supabase
          .from('servicos')
          .delete()
          .in('id', servicos.map(item => item.id))
        
        if (servicosError) {
          console.error('Erro ao deletar serviços:', servicosError)
          throw servicosError
        }
      }
      console.log('✅ Serviços deletados')
      
      // 4. Funcionários (tabela base)
      const { data: funcionarios } = await supabase
        .from('funcionarios')
        .select('id')
      
      if (funcionarios && funcionarios.length > 0) {
        const { error: funcionariosError } = await supabase
          .from('funcionarios')
          .delete()
          .in('id', funcionarios.map(item => item.id))
        
        if (funcionariosError) {
          console.error('Erro ao deletar funcionários:', funcionariosError)
          throw funcionariosError
        }
      }
      console.log('✅ Funcionários deletados')
      
      console.log('🎉 Reset do banco de dados concluído com sucesso!')
      
    } catch (error) {
      console.error('❌ Erro durante reset do banco:', error)
      throw new Error('Falha ao resetar banco de dados: ' + (error as Error).message)
    }
  },

  // Obter estatísticas do banco
  async getDatabaseStats(): Promise<{
    funcionarios: number
    servicos: number
    movimentacoes: number
    agendamentos: number
    total: number
  }> {
    try {
      // Contar registros em cada tabela
      const [funcionarios, servicos, movimentacoes, agendamentos] = await Promise.all([
        supabase.from('funcionarios').select('*', { count: 'exact', head: true }),
        supabase.from('servicos').select('*', { count: 'exact', head: true }),
        supabase.from('movimentacoes_financeiras').select('*', { count: 'exact', head: true }),
        supabase.from('agendamentos').select('*', { count: 'exact', head: true })
      ])

      const stats = {
        funcionarios: funcionarios.count || 0,
        servicos: servicos.count || 0,
        movimentacoes: movimentacoes.count || 0,
        agendamentos: agendamentos.count || 0,
        total: 0
      }

      stats.total = stats.funcionarios + stats.servicos + stats.movimentacoes + stats.agendamentos

      return stats
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      return {
        funcionarios: 0,
        servicos: 0,
        movimentacoes: 0,
        agendamentos: 0,
        total: 0
      }
    }
  },

  // Inserir dados de exemplo para testes
  async insertSampleData(): Promise<void> {
    try {
      console.log('📝 Inserindo dados de exemplo...')
      
      // 1. Inserir funcionários de exemplo
      const { data: funcionarios, error: funcionariosError } = await supabase
        .from('funcionarios')
        .insert([
          {
            nome: 'Maria',
            sobrenome: 'Silva',
            telefone: '(11) 99999-1111',
            email: 'maria@salao.com',
            funcao: 'Cabeleireira',
            ativo: true,
            meta_semanal: 2000,
            meta_mensal: 8000,
            comissao_percentual: 15
          },
          {
            nome: 'Ana',
            sobrenome: 'Santos',
            telefone: '(11) 99999-2222',
            email: 'ana@salao.com',
            funcao: 'Manicure',
            ativo: true,
            meta_semanal: 1500,
            meta_mensal: 6000,
            comissao_percentual: 20
          },
          {
            nome: 'Carla',
            sobrenome: 'Costa',
            telefone: '(11) 99999-3333',
            email: 'carla@salao.com',
            funcao: 'Esteticista',
            ativo: true,
            meta_semanal: 2500,
            meta_mensal: 10000,
            comissao_percentual: 18
          },
          {
            nome: 'Julia',
            sobrenome: 'Oliveira',
            telefone: '(11) 99999-4444',
            email: 'julia@salao.com',
            funcao: 'Depiladora',
            ativo: true,
            meta_semanal: 1800,
            meta_mensal: 7200,
            comissao_percentual: 22
          }
        ])
        .select()

      if (funcionariosError) throw funcionariosError
      console.log(`✅ ${funcionarios?.length} funcionários inseridos`)

      // 2. Inserir serviços de exemplo
      const { data: servicos, error: servicosError } = await supabase
        .from('servicos')
        .insert([
          {
            nome: 'Corte Feminino',
            valor_base: 80.00,
            funcionario_responsavel_id: funcionarios?.[0]?.id,
            ativo: true,
            descricao: 'Corte de cabelo feminino com lavagem e finalização'
          },
          {
            nome: 'Corte Masculino', 
            valor_base: 45.00,
            funcionario_responsavel_id: funcionarios?.[0]?.id,
            ativo: true,
            descricao: 'Corte de cabelo masculino tradicional'
          },
          {
            nome: 'Escova Progressiva',
            valor_base: 200.00,
            funcionario_responsavel_id: funcionarios?.[0]?.id,
            ativo: true,
            descricao: 'Tratamento alisante com escova progressiva'
          },
          {
            nome: 'Manicure Completa',
            valor_base: 35.00,
            funcionario_responsavel_id: funcionarios?.[1]?.id,
            ativo: true,
            descricao: 'Cuidados completos para as unhas das mãos'
          },
          {
            nome: 'Pedicure Completa',
            valor_base: 40.00,
            funcionario_responsavel_id: funcionarios?.[1]?.id,
            ativo: true,
            descricao: 'Cuidados completos para as unhas dos pés'
          },
          {
            nome: 'Coloração',
            valor_base: 120.00,
            funcionario_responsavel_id: funcionarios?.[0]?.id,
            ativo: true,
            descricao: 'Coloração completa do cabelo'
          },
          {
            nome: 'Limpeza de Pele',
            valor_base: 90.00,
            funcionario_responsavel_id: funcionarios?.[2]?.id,
            ativo: true,
            descricao: 'Limpeza facial profunda'
          },
          {
            nome: 'Depilação Perna Completa',
            valor_base: 70.00,
            funcionario_responsavel_id: funcionarios?.[3]?.id,
            ativo: true,
            descricao: 'Depilação com cera das pernas completas'
          },
          {
            nome: 'Sobrancelha',
            valor_base: 25.00,
            funcionario_responsavel_id: funcionarios?.[3]?.id,
            ativo: true,
            descricao: 'Design e depilação das sobrancelhas'
          },
          {
            nome: 'Hidratação',
            valor_base: 60.00,
            funcionario_responsavel_id: funcionarios?.[0]?.id,
            ativo: true,
            descricao: 'Tratamento hidratante para cabelos'
          }
        ])
        .select()

      if (servicosError) throw servicosError
      console.log(`✅ ${servicos?.length} serviços inseridos`)

      // 3. Inserir movimentações dos últimos 30 dias
      const movimentacoes = []
      const hoje = new Date()
      
      // Gerar movimentações para os últimos 30 dias
      for (let i = 0; i < 30; i++) {
        const data = new Date(hoje)
        data.setDate(hoje.getDate() - i)
        
        // 2-5 atendimentos por dia
        const numAtendimentos = Math.floor(Math.random() * 4) + 2
        
        for (let j = 0; j < numAtendimentos; j++) {
          const servicoAleatorio = servicos![Math.floor(Math.random() * servicos!.length)]
          
          // 90% entradas (serviços), 10% saídas (despesas)
          const isEntrada = Math.random() > 0.1
          
          if (isEntrada) {
            const clientes = [
              'Ana Paula', 'Beatriz', 'Camila', 'Daniela', 'Eduarda',
              'Fernanda', 'Gabriela', 'Helena', 'Isabela', 'Juliana'
            ]
            const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)]
            const metodoPagamento = ['PIX', 'DINHEIRO', 'CREDITO', 'DEBITO'][Math.floor(Math.random() * 4)]
            
            movimentacoes.push({
              tipo: 'ENTRADA',
              valor: servicoAleatorio.valor_base,
              descricao: `${servicoAleatorio.nome} - ${clienteAleatorio}`,
              metodo_pagamento: metodoPagamento,
              funcionario_id: servicoAleatorio.funcionario_responsavel_id,
              servico_id: servicoAleatorio.id,
              cliente_nome: clienteAleatorio,
              data_movimentacao: data.toISOString()
            })
          } else {
            // Despesas variadas
            const despesas = [
              { desc: 'Produtos de Cabelo', valor: 150.00 },
              { desc: 'Material de Limpeza', valor: 80.00 },
              { desc: 'Energia Elétrica', valor: 320.00 },
              { desc: 'Produtos de Estética', valor: 200.00 },
              { desc: 'Manutenção Equipamentos', valor: 180.00 },
              { desc: 'Internet', valor: 120.00 },
              { desc: 'Produtos para Unhas', valor: 95.00 }
            ]
            
            const despesaAleatoria = despesas[Math.floor(Math.random() * despesas.length)]
            
            movimentacoes.push({
              tipo: 'SAIDA',
              valor: despesaAleatoria.valor,
              descricao: despesaAleatoria.desc,
              metodo_pagamento: 'DINHEIRO',
              data_movimentacao: data.toISOString()
            })
          }
        }
      }

      // Inserir movimentações em lotes para evitar timeout
      const BATCH_SIZE = 50
      for (let i = 0; i < movimentacoes.length; i += BATCH_SIZE) {
        const batch = movimentacoes.slice(i, i + BATCH_SIZE)
        const { error: movimentacoesError } = await supabase
          .from('movimentacoes_financeiras')
          .insert(batch)

        if (movimentacoesError) throw movimentacoesError
      }

      console.log(`✅ ${movimentacoes.length} movimentações inseridas`)

      // 4. Inserir alguns agendamentos para os próximos dias
      const agendamentos = []
      
      for (let i = 1; i <= 7; i++) {
        const data = new Date(hoje)
        data.setDate(hoje.getDate() + i)
        
        // 3-6 agendamentos por dia
        const numAgendamentos = Math.floor(Math.random() * 4) + 3
        
        for (let j = 0; j < numAgendamentos; j++) {
          const servicoAleatorio = servicos![Math.floor(Math.random() * servicos!.length)]
          
          // Horários entre 9h e 18h
          const hora = Math.floor(Math.random() * 9) + 9
          const minuto = Math.random() > 0.5 ? 0 : 30
          
          const dataHora = new Date(data)
          dataHora.setHours(hora, minuto, 0, 0)
          
          const clientes = [
            'Maria José', 'Paula Silva', 'Roberta Lima', 'Sandra Costa',
            'Tatiana Souza', 'Vanessa Alves', 'Cláudia Ramos', 'Márcia Dias'
          ]
          const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)]
          
          agendamentos.push({
            cliente_nome: clienteAleatorio,
            cliente_telefone: `(11) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
            servico_id: servicoAleatorio.id,
            funcionario_id: servicoAleatorio.funcionario_responsavel_id,
            data_agendamento: dataHora.toISOString(),
            valor_servico: servicoAleatorio.valor_base,
            status: 'AGENDADO',
            observacoes: `Agendamento para ${servicoAleatorio.nome}`
          })
        }
      }

      // Inserir agendamentos
      const { error: agendamentosError } = await supabase
        .from('agendamentos')
        .insert(agendamentos)

      if (agendamentosError) throw agendamentosError
      console.log(`✅ ${agendamentos.length} agendamentos inseridos`)

      console.log('🎉 Dados de exemplo inseridos com sucesso!')
      
    } catch (error) {
      console.error('❌ Erro ao inserir dados de exemplo:', error)
      throw new Error('Falha ao inserir dados de exemplo: ' + (error as Error).message)
    }
  }
}