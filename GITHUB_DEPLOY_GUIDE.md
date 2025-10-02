# 🎯 GUIA COMPLETO: GITHUB + VERCEL DEPLOY

## Beauty Salon Dashboard

> **Objetivo**: Subir código para GitHub e fazer deploy automático via Vercel

---

## 📋 ETAPA 1: PREPARAR REPOSITÓRIO LOCAL

### 1.1 Verificar arquivos essenciais

```bash
cd "c:\Users\davim\OneDrive\Área de Trabalho\SISTEMA_V2.0\beauty-salon-dashboard"

# Verificar se temos todos os arquivos
dir
```

**Arquivos que devem existir:**

- ✅ `README.md` - Documentação atualizada
- ✅ `package.json` - Dependências do projeto
- ✅ `.gitignore` - Arquivos a ignorar
- ✅ `.env.example` - Exemplo de variáveis
- ✅ `LICENSE` - Licença MIT
- ✅ `vercel.json` - Configuração Vercel
- ✅ `netlify.toml` - Configuração Netlify (alternativa)

### 1.2 Inicializar Git (se não existir)

```bash
# Verificar se já é um repositório git
git status

# Se não for, inicializar
git init
git branch -M main
```

### 1.3 Configurar Git (primeira vez)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@gmail.com"
```

---

## 📁 ETAPA 2: CRIAR REPOSITÓRIO NO GITHUB

### 2.1 Opção A: Via Interface Web (Recomendado)

1. Acesse [github.com](https://github.com)
2. Clique em **"New repository"** (botão verde)
3. Preencha:
   - **Repository name**: `beauty-salon-dashboard`
   - **Description**: `💄 Sistema completo de gestão para salão de beleza`
   - **Visibility**: `Public` (ou Private se preferir)
   - **NÃO** marque "Add a README file" (já temos)
   - **NÃO** marque "Add .gitignore" (já temos)
   - **License**: None (já temos MIT)
4. Clique **"Create repository"**

### 2.2 Opção B: Via GitHub CLI

```bash
# Instalar GitHub CLI (se não tiver)
winget install GitHub.cli

# Fazer login
gh auth login

# Criar repositório
gh repo create beauty-salon-dashboard --public --description "💄 Sistema completo de gestão para salão de beleza"
```

---

## 🚀 ETAPA 3: ENVIAR CÓDIGO PARA GITHUB

### 3.1 Adicionar origem remota

```bash
# Substituir SEU_USUARIO pelo seu username do GitHub
git remote add origin https://github.com/SEU_USUARIO/beauty-salon-dashboard.git

# Verificar se foi adicionado
git remote -v
```

### 3.2 Preparar commit inicial

```bash
# Adicionar todos os arquivos
git add .

# Verificar o que será commitado
git status

# Fazer o commit inicial
git commit -m "🎉 Initial commit: Beauty Salon Dashboard v1.0

✨ Features:
- 🔐 Autenticação com Supabase + bcrypt
- 👑 Admin: 9 funcionalidades completas
- 👥 Recepção: 2 funcionalidades (Financeiro + Agendamento)
- 🎨 Interface moderna com Chakra UI + Dark Mode
- 📱 Totalmente responsivo
- 🧪 49 cenários de teste documentados
- 🚀 Pronto para produção

🛠️ Tech Stack:
- React 18 + TypeScript + Vite
- Supabase (PostgreSQL)
- Chakra UI + Framer Motion
- Google Calendar API
- Recharts para gráficos"
```

### 3.3 Enviar para GitHub

```bash
# Push para o repositório remoto
git push -u origin main
```

---

## 🌐 ETAPA 4: DEPLOY AUTOMÁTICO COM VERCEL

### 4.1 Conectar GitHub com Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique **"Sign up"** ou **"Login"**
3. Escolha **"Continue with GitHub"**
4. Autorize o Vercel a acessar seus repositórios

### 4.2 Importar projeto

1. No dashboard do Vercel, clique **"New Project"**
2. Encontre `beauty-salon-dashboard` na lista
3. Clique **"Import"**

### 4.3 Configurar deploy

**Framework Preset**: `Vite` (detectado automaticamente)
**Root Directory**: `./` (padrão)
**Build Command**: `npm run build` (padrão)
**Output Directory**: `dist` (padrão)
**Install Command**: `npm install` (padrão)

### 4.4 Configurar variáveis de ambiente

**ANTES de fazer deploy**, clique em **"Environment Variables"** e adicione:

```env
VITE_SUPABASE_URL=https://bzkdmmeusfxfkgbrcgvn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6a2RtbWV1c2Z4ZmtnYnJjZ3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc0NTIsImV4cCI6MjA3NDk5MzQ1Mn0.OIPEJY-J0ox3kgUcJsC6IxXNuRhnbq-KWFFJCezlE4o
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_REDIRECT_URI=https://beauty-salon-dashboard.vercel.app/auth/google/callback
VITE_GOOGLE_CALENDAR_ID=primary
```

⚠️ **IMPORTANTE**: Substitua a URL de `VITE_GOOGLE_REDIRECT_URI` pela URL real que o Vercel vai gerar.

### 4.5 Fazer deploy

1. Clique **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. ✅ Deploy concluído!

---

## 🔧 ETAPA 5: CONFIGURAÇÕES PÓS-DEPLOY

### 5.1 Atualizar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Vá em **APIs & Services > Credentials**
3. Edite seu OAuth 2.0 Client ID
4. Adicione a URL de produção em **Authorized redirect URIs**:
   ```
   https://beauty-salon-dashboard.vercel.app/auth/google/callback
   ```
   (substitua pela URL real gerada pelo Vercel)

### 5.2 Atualizar variável de ambiente

1. No painel do Vercel, vá em **Settings > Environment Variables**
2. Edite `VITE_GOOGLE_REDIRECT_URI` com a URL real:
   ```
   https://beauty-salon-dashboard.vercel.app/auth/google/callback
   ```
3. Clique **"Save"**
4. Vá em **Deployments** e clique **"Redeploy"** no último deploy

### 5.3 Configurar domínio personalizado (Opcional)

1. No Vercel, vá em **Settings > Domains**
2. Adicione seu domínio: `beautysalon.com.br`
3. Configure DNS conforme instruções
4. Atualize URLs no Google Cloud Console

---

## ✅ ETAPA 6: VALIDAÇÃO FINAL

### 6.1 Testar aplicação

Acesse sua URL do Vercel e teste:

**Admin:**

- Email: `admin@beautysalon.com`
- Senha: `admin123`
- ✅ Deve ver 9 funcionalidades

**Recepção:**

- Email: `recepcao@beautysalon.com`
- Senha: `recepcao123`
- ✅ Deve ver apenas 2 funcionalidades

### 6.2 Verificar funcionalidades

- [ ] Login funcionando
- [ ] Controle de acesso por role
- [ ] Interface responsiva
- [ ] Dark mode
- [ ] Navegação entre páginas
- [ ] Logout

---

## 🔄 ETAPA 7: FLUXO DE DESENVOLVIMENTO CONTÍNUO

### 7.1 Futuras atualizações

```bash
# 1. Fazer alterações no código
# 2. Commit e push
git add .
git commit -m "✨ Nova funcionalidade: descrição"
git push

# 3. Vercel faz deploy automático! 🎉
```

### 7.2 Branches para features

```bash
# Criar branch para nova feature
git checkout -b feature/nova-funcionalidade

# Fazer alterações e commit
git add .
git commit -m "✨ Add: nova funcionalidade"

# Push da branch
git push origin feature/nova-funcionalidade

# No GitHub: criar Pull Request
# Após aprovação: merge para main = deploy automático
```

---

## 🎯 SCRIPT AUTOMATIZADO COMPLETO

### Para Windows (PowerShell):

```powershell
# 1. Navegar para o projeto
cd "c:\Users\davim\OneDrive\Área de Trabalho\SISTEMA_V2.0\beauty-salon-dashboard"

# 2. Configurar Git (substituir pelos seus dados)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@gmail.com"

# 3. Inicializar repositório
git init
git branch -M main

# 4. Adicionar origem remota (substituir SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/beauty-salon-dashboard.git

# 5. Commit inicial
git add .
git commit -m "🎉 Initial commit: Beauty Salon Dashboard v1.0"

# 6. Push para GitHub
git push -u origin main

# 7. Acessar vercel.com para fazer deploy
Write-Host "✅ Código enviado para GitHub!"
Write-Host "🌐 Agora acesse https://vercel.com para fazer o deploy"
```

---

## 📞 TROUBLESHOOTING

### Erro: "Permission denied (publickey)"

```bash
# Gerar nova chave SSH
ssh-keygen -t ed25519 -C "seu.email@gmail.com"

# Adicionar ao ssh-agent
ssh-add ~/.ssh/id_ed25519

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar no GitHub: Settings > SSH and GPG keys
```

### Erro: "Remote already exists"

```bash
# Remover origem existente
git remote remove origin

# Adicionar novamente
git remote add origin https://github.com/SEU_USUARIO/beauty-salon-dashboard.git
```

### Build falha no Vercel

1. Verificar se `npm run build` funciona localmente
2. Verificar variáveis de ambiente
3. Verificar logs no painel do Vercel
4. Verificar se `.vercel.json` está correto

---

## 🎉 RESULTADO FINAL

Após seguir este guia você terá:

✅ **Código no GitHub**: Backup seguro e versionamento
✅ **Deploy automático**: Cada push = novo deploy
✅ **URL de produção**: Sistema acessível publicamente
✅ **HTTPS automático**: Segurança garantida
✅ **CDN global**: Performance mundial
✅ **Monitoramento**: Analytics e logs

**URLs finais:**

- 📂 **GitHub**: `https://github.com/SEU_USUARIO/beauty-salon-dashboard`
- 🌐 **Vercel**: `https://beauty-salon-dashboard.vercel.app`
- 📊 **Analytics**: Painel do Vercel

🎊 **Parabéns! Seu sistema está em produção!**
