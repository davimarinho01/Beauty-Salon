# Beauty Salon Dashboard

> 💄 Sistema completo de gestão para salão de beleza com autenticação e controle de acesso baseado em roles.

## 🚀 Funcionalidades

- **🔐 Autenticação Segura**: Login com database Supabase + bcrypt
- **👑 Admin**: Acesso completo a 9 funcionalidades (Dashboard, Financeiro, Agendamento, Clientes, Estoque, Funcionários, Relatórios, Promoções, Configurações)
- **👥 Recepção**: Acesso limitado a 2 funcionalidades (Financeiro e Agendamento)
- **🎨 Interface Moderna**: Chakra UI + Dark Mode
- **📱 Responsivo**: Funciona em desktop, tablet e mobile
- **📊 Dashboard Analytics**: Métricas e relatórios
- **📅 Integração Google Calendar**: Sincronização de agendamentos

## �️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI/UX**: Chakra UI + Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Autenticação**: bcrypt + JWT
- **Calendar**: Google Calendar API
- **Charts**: Recharts
- **Icons**: React Icons + Lucide React

## 🏃‍♂️ Início Rápido

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/beauty-salon-dashboard.git
cd beauty-salon-dashboard
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_do_supabase

# Google Calendar API
VITE_GOOGLE_CLIENT_ID=seu_client_id
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
VITE_GOOGLE_CALENDAR_ID=primary
```

### 4. Execute o projeto

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 🔑 Credenciais de Teste

### Admin (Acesso Completo)

- **Email**: `admin@beautysalon.com`
- **Senha**: `admin123`

### Recepção (Acesso Limitado)

- **Email**: `recepcao@beautysalon.com`
- **Senha**: `recepcao123`

## � Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Análise de código
```

## 🧪 Testes

O projeto inclui 49 cenários de teste documentados:

```bash
# Testes manuais
python manual_validation.py

# Testes automatizados (requer Selenium)
python test_runner.py
```

## � Deploy

### Vercel (Recomendado)

```bash
vercel
```

### Netlify

```bash
netlify deploy
```

Veja o guia completo em [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md)

## 🔒 Controle de Acesso

### Admin

- ✅ Dashboard (Principal)
- ✅ Financeiro
- ✅ Agendamento
- ✅ Clientes
- ✅ Estoque
- ✅ Funcionários
- ✅ Relatórios
- ✅ Promoções
- ✅ Configurações

### Recepção

- ✅ Financeiro
- ✅ Agendamento
- ❌ Demais funcionalidades (ocultas)

## �️ Database Schema

### Usuários

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar UNIQUE NOT NULL,
  password_hash varchar NOT NULL,
  nome varchar NOT NULL,
  role varchar CHECK (role IN ('admin', 'reception')) NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

## 🔐 Segurança

- **🔒 Senhas criptografadas** com bcrypt
- **🛡️ Headers de segurança** configurados
- **🚫 SQL Injection** protegido via Supabase
- **🔐 HTTPS** obrigatório em produção
- **⚡ Rate limiting** no Supabase

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Desenvolvido com ❤️ para salões de beleza modernos e sofisticados.
