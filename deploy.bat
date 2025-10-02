@echo off
echo 🚀 DEPLOY DO BEAUTY SALON DASHBOARD
echo ====================================

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ Erro: Execute este script na pasta do projeto
    pause
    exit /b 1
)

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não está instalado!
    echo 💡 Baixe em: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se npm está funcionando
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ NPM não está funcionando!
    pause
    exit /b 1
)

echo ✅ Node.js e NPM detectados

REM Instalar dependências se necessário
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
)

REM Testar build
echo 🔨 Testando build de produção...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Erro no build! Corrija os erros antes do deploy.
    pause
    exit /b 1
)

echo ✅ Build funcionando!

REM Verificar se Vercel CLI está instalado
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Instalando Vercel CLI...
    npm install -g vercel
)

REM Verificar login
echo 🔐 Verificando login no Vercel...
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔑 Fazendo login no Vercel...
    vercel login
)

REM Deploy
echo 🚀 Iniciando deploy...
vercel

echo.
echo ✅ Deploy concluído!
echo.
echo 📋 PRÓXIMOS PASSOS:
echo 1. Acesse https://vercel.com/dashboard
echo 2. Configure as variáveis de ambiente:
echo    - VITE_SUPABASE_URL
echo    - VITE_SUPABASE_ANON_KEY
echo    - VITE_GOOGLE_CLIENT_ID
echo    - VITE_GOOGLE_CLIENT_SECRET
echo    - VITE_GOOGLE_REDIRECT_URI
echo    - VITE_GOOGLE_CALENDAR_ID
echo.
echo 3. Depois de configurar, execute:
echo    vercel --prod
echo.
echo 🎉 Seu sistema estará em produção!
echo.
pause