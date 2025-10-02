# 📅 Integração Google Calendar - Guia de Configuração

## 🚀 Visão Geral

A integração com Google Calendar permite sincronização automática bidirecional dos agendamentos do salão de beleza:

- ✅ **Criação automática** de eventos no Google Calendar
- ✅ **Sincronização** de alterações de status e horários
- ✅ **Remoção automática** de eventos cancelados
- ✅ **Lembretes** por email e popup
- ✅ **Cores por status** para fácil identificação

## 📋 Pré-requisitos

1. **Conta Google** com acesso ao Google Calendar
2. **Projeto no Google Cloud Console**
3. **Acesso à Google Calendar API**

## 🛠️ Configuração Passo a Passo

### 1. Configurar Google Cloud Console

1. **Acesse** https://console.cloud.google.com/
2. **Crie** um novo projeto ou **selecione** um existente
3. **Vá para** "APIs e Serviços" > "Biblioteca"
4. **Procure** e **ative** a "Google Calendar API"

### 2. Criar Credenciais OAuth 2.0

1. **Vá para** "APIs e Serviços" > "Credenciais"
2. **Clique** em "Criar credenciais" > "ID do cliente OAuth"
3. **Selecione** "Aplicativo da Web"
4. **Configure**:

   - **Nome**: Sistema Salão de Beleza
   - **URIs de redirecionamento autorizados**:
     ```
     http://localhost:3000/auth/google/callback
     http://localhost:3000
     ```

5. **Copie** o Client ID e Client Secret gerados

### 3. Configurar Variáveis de Ambiente

No arquivo `.env` do projeto, configure:

```env
# Google Calendar API
VITE_GOOGLE_CLIENT_ID=seu_client_id_real
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_real
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
VITE_GOOGLE_CALENDAR_ID=primary
```

### 4. Reiniciar a Aplicação

```bash
npm run dev
```

## 🎯 Como Usar

### 1. Conectar ao Google Calendar

1. **Acesse** a página de Agendamentos
2. **Clique** no botão "Google Calendar"
3. **Configure** as credenciais (se necessário)
4. **Clique** em "Conectar Google Calendar"
5. **Autorize** o acesso na popup do Google

### 2. Sincronização Automática

A partir da conexão, todos os agendamentos serão:

- ✅ **Criados automaticamente** no Google Calendar
- ✅ **Atualizados** quando o status mudar
- ✅ **Removidos** quando cancelados
- ✅ **Coloridos** por status:
  - 🔵 **Azul**: Agendado
  - 🟢 **Verde**: Confirmado
  - 🟡 **Amarelo**: Realizado
  - 🔴 **Vermelho**: Cancelado

### 3. Informações do Evento

Cada evento criado contém:

```
📅 [Status] Cliente - Serviço

📋 Detalhes:
• Cliente: Nome do Cliente
• Telefone: (11) 99999-9999
• Serviço: Nome do Serviço
• Funcionário: Nome do Funcionário
• Status: CONFIRMADO

📝 Observações:
Observações específicas do agendamento

🏢 Local: Salão de Beleza
⏰ Lembretes: 1 dia antes + 30 min antes
```

## 🔧 Funcionalidades Técnicas

### Serviços Implementados

- **`googleAuthService`**: Gerencia autenticação OAuth2
- **`googleCalendarService`**: Controla eventos do calendário
- **`GoogleCalendarConfigModal`**: Interface de configuração

### Integração no CRUD

```typescript
// Criar agendamento
const eventId = await googleCalendarService.createEvent(
  agendamento,
  funcionario,
  servico
);

// Atualizar agendamento
await googleCalendarService.updateEvent(
  eventId,
  agendamento,
  funcionario,
  servico
);

// Deletar agendamento
await googleCalendarService.deleteEvent(eventId);
```

### Fallback Automático

- Se o Google Calendar não estiver disponível, os agendamentos funcionam normalmente
- Logs informativos no console para debugging
- Não falha operações por problemas de sincronização

## ⚠️ Troubleshooting

### Problema: "Configuração Necessária"

**Solução**: Configure as variáveis `VITE_GOOGLE_CLIENT_ID` e `VITE_GOOGLE_CLIENT_SECRET`

### Problema: "Falha na Autenticação"

**Solução**:

1. Verifique as URIs de redirecionamento no Google Cloud Console
2. Confirme se a Google Calendar API está ativada
3. Teste com uma nova janela/incógnito

### Problema: Eventos não aparecem

**Solução**:

1. Verifique se está conectado (botão deve mostrar "Desconectar")
2. Confirme permissões no Google Calendar
3. Verifique o console do navegador para erros

### Problema: "Token Expirado"

**Solução**: O sistema renova automaticamente, mas se persistir:

1. Desconecte e reconecte
2. Limpe o localStorage do navegador

## 🔒 Segurança

- **OAuth 2.0** com refresh tokens para segurança
- **Tokens armazenados** apenas no localStorage (client-side)
- **Escopos mínimos** necessários para operação
- **HTTPS obrigatório** em produção

## 🚀 Produção

Para deploy em produção:

1. **Configure** domínio real nas URIs de redirecionamento
2. **Atualize** `VITE_GOOGLE_REDIRECT_URI` para URL de produção
3. **Use HTTPS** obrigatoriamente
4. **Configure** ambiente de produção no Google Cloud Console

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. **Verifique** os logs do console do navegador
2. **Teste** a configuração através do modal
3. **Confirme** as credenciais no Google Cloud Console
4. **Documente** erros específicos para suporte técnico
