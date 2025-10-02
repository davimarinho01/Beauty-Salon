#!/bin/bash

# 🚀 SCRIPT DE DEPLOY AUTOMATIZADO
# Beauty Salon Dashboard - Deploy para Vercel

echo "🚀 INICIANDO DEPLOY DO BEAUTY SALON DASHBOARD"
echo "=============================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na pasta do projeto"
    exit 1
fi

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Verificar se o build funciona
echo "🔨 Testando build de produção..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build! Corrija os erros antes do deploy."
    exit 1
fi

echo "✅ Build funcionando! Continuando..."

# Verificar se está logado no Vercel
echo "🔐 Verificando login no Vercel..."
vercel whoami

if [ $? -ne 0 ]; then
    echo "🔑 Fazendo login no Vercel..."
    vercel login
fi

# Deploy
echo "🚀 Iniciando deploy..."
vercel

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Acesse o painel do Vercel para configurar variáveis de ambiente"
echo "2. Configure as seguintes variáveis:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "   - VITE_GOOGLE_CLIENT_ID"
echo "   - VITE_GOOGLE_CLIENT_SECRET"
echo "   - VITE_GOOGLE_REDIRECT_URI"
echo "   - VITE_GOOGLE_CALENDAR_ID"
echo ""
echo "3. Depois de configurar as variáveis, execute:"
echo "   vercel --prod"
echo ""
echo "🎉 Seu sistema estará em produção!"