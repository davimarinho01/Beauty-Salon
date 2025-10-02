@echo off
title Beauty Salon Dashboard - GitHub Setup
color 0A

echo.
echo ██████╗ ███████╗ █████╗ ██╗   ██╗████████╗██╗   ██╗    ███████╗ █████╗ ██╗       echo    VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
    echo    VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here ██████╗ ███╗   ██╗
echo ██╔══██╗██╔════╝██╔══██╗██║   ██║╚══██╔══╝╚██╗ ██╔╝    ██╔════╝██╔══██╗██║     ██╔═══██╗████╗  ██║
echo ██████╔╝█████╗  ███████║██║   ██║   ██║    ╚████╔╝     ███████╗███████║██║     ██║   ██║██╔██╗ ██║
echo ██╔══██╗██╔══╝  ██╔══██║██║   ██║   ██║     ╚██╔╝      ╚════██║██╔══██║██║     ██║   ██║██║╚██╗██║
echo ██████╔╝███████╗██║  ██║╚██████╔╝   ██║      ██║       ███████║██║  ██║███████╗╚██████╔╝██║ ╚████║
echo ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝    ╚═╝      ╚═╝       ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝
echo.
echo                          📂 SETUP GITHUB + VERCEL DEPLOY
echo                              Sistema Pronto para Produção
echo.
echo ================================================================================

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ ERRO: Execute este script na pasta do projeto beauty-salon-dashboard
    echo.
    echo 💡 Navegue até a pasta correta e execute novamente:
    echo    cd "c:\Users\davim\OneDrive\Área de Trabalho\SISTEMA_V2.0\beauty-salon-dashboard"
    echo    setup-github.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Projeto encontrado: Beauty Salon Dashboard
echo.

REM Verificar Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git não está instalado!
    echo.
    echo 💡 Instale o Git:
    echo    1. Acesse: https://git-scm.com/download/win
    echo    2. Baixe e instale
    echo    3. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo ✅ Git detectado

REM Solicitar dados do usuário
echo.
echo 📝 CONFIGURAÇÃO INICIAL
echo ================================================================================
echo.

set /p GITHUB_USER="Digite seu username do GitHub: "
set /p USER_NAME="Digite seu nome completo: "
set /p USER_EMAIL="Digite seu email: "

echo.
echo 🔧 CONFIGURANDO GIT...
git config --global user.name "%USER_NAME%"
git config --global user.email "%USER_EMAIL%"
echo ✅ Git configurado

echo.
echo 📂 INICIALIZANDO REPOSITÓRIO...

REM Verificar se já é um repositório Git
git status >nul 2>&1
if %errorlevel% neq 0 (
    git init
    git branch -M main
    echo ✅ Repositório Git inicializado
) else (
    echo ℹ️  Repositório Git já existe
)

REM Configurar origem remota
echo.
echo 🌐 CONFIGURANDO ORIGEM REMOTA...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/%GITHUB_USER%/beauty-salon-dashboard.git
echo ✅ Origem remota configurada: https://github.com/%GITHUB_USER%/beauty-salon-dashboard

echo.
echo 📦 PREPARANDO COMMIT INICIAL...

REM Adicionar todos os arquivos
git add .

REM Fazer commit
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
- Recharts para gráficos

🎯 Sistema completo de gestão para salão de beleza"

echo ✅ Commit preparado

echo.
echo 🚀 ENVIANDO PARA GITHUB...
echo.
echo ⚠️  ATENÇÃO: Você precisa criar o repositório no GitHub primeiro!
echo.
echo 📋 PASSOS MANUAIS NECESSÁRIOS:
echo    1. Acesse: https://github.com/new
echo    2. Repository name: beauty-salon-dashboard  
echo    3. Description: 💄 Sistema completo de gestão para salão de beleza
echo    4. Public ou Private (sua escolha)
echo    5. NÃO marque "Add a README file" 
echo    6. NÃO marque "Add .gitignore"
echo    7. Clique "Create repository"
echo.

set /p CONFIRM="Você já criou o repositório no GitHub? (s/n): "
if /i "%CONFIRM%" neq "s" (
    echo.
    echo ⏸️  Processo pausado. Crie o repositório no GitHub e execute novamente.
    echo.
    pause
    exit /b 0
)

echo.
echo 📤 Enviando código para GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCESSO! Código enviado para GitHub
    echo.
    echo 🎉 PRÓXIMOS PASSOS - DEPLOY NO VERCEL:
    echo ================================================================================
    echo.
    echo 1. 🌐 Acesse: https://vercel.com
    echo 2. 🔐 Faça login com GitHub
    echo 3. 📂 Clique "New Project"
    echo 4. 🔍 Encontre "beauty-salon-dashboard" 
    echo 5. 📥 Clique "Import"
    echo.
    echo 6. ⚙️  Configure as variáveis de ambiente:
    echo    VITE_SUPABASE_URL=https://bzkdmmeusfxfkgbrcgvn.supabase.co
    echo    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    echo    VITE_GOOGLE_CLIENT_ID=184296697121-fosu9q3681supvceucen2r0248l8j87u...
    echo    VITE_GOOGLE_CLIENT_SECRET=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
    echo    VITE_GOOGLE_REDIRECT_URI=https://SEU-PROJETO.vercel.app/auth/google/callback
    echo    VITE_GOOGLE_CALENDAR_ID=primary
    echo.
    echo 7. 🚀 Clique "Deploy"
    echo 8. ⏱️  Aguarde 2-5 minutos
    echo 9. ✅ Sistema em produção!
    echo.
    echo 📊 URLs IMPORTANTES:
    echo    📂 GitHub: https://github.com/%GITHUB_USER%/beauty-salon-dashboard
    echo    🌐 Vercel: (será gerada após deploy)
    echo.
    echo 🔧 GUIA COMPLETO: GITHUB_DEPLOY_GUIDE.md
    echo.
) else (
    echo.
    echo ❌ ERRO ao enviar para GitHub
    echo.
    echo 💡 POSSÍVEIS SOLUÇÕES:
    echo    1. Verifique se o repositório foi criado no GitHub
    echo    2. Verifique seu username: %GITHUB_USER%
    echo    3. Configure SSH keys se necessário
    echo    4. Consulte: GITHUB_DEPLOY_GUIDE.md
    echo.
)

echo.
echo 📋 CREDENCIAIS PARA TESTAR:
echo ================================================================================
echo 👑 ADMIN (9 funcionalidades):
echo    Email: admin@beautysalon.com
echo    Senha: admin123
echo.
echo 👥 RECEPÇÃO (2 funcionalidades):  
echo    Email: recepcao@beautysalon.com
echo    Senha: recepcao123
echo.

echo Pressione qualquer tecla para finalizar...
pause >nul