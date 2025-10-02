# 🚀 GUIA DE DEPLOY PARA PRODUÇÃO

## Beauty Salon Dashboard v1.0

> **Status**: ✅ Sistema validado e pronto para produção
> **Data**: Outubro 2025
> **Funcionalidades**: Autenticação completa + Controle de acesso baseado em roles

---

## 📋 PRÉ-REQUISITOS CUMPRIDOS

✅ **Sistema funcional**

- Autenticação com database Supabase
- Controle de acesso: Admin (9 funcionalidades) vs Recepção (2 funcionalidades)
- Interface responsiva com Chakra UI + Dark Mode
- Build de produção funcionando (1.7MB otimizado)

✅ **Testes validados**

- 49 cenários de teste documentados
- Validação manual criada
- Funcionalidades principais testadas

✅ **Configurações**

- Variáveis de ambiente configuradas
- Database Supabase ativo
- Build otimizado e comprimido

---

## 🎯 OPÇÕES DE DEPLOY

### 1. 🌟 **VERCEL** (Recomendado - Grátis)

**Melhor para React/Vite + integração com GitHub**

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy direto
vercel

# 4. Configurar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GOOGLE_CLIENT_ID
vercel env add VITE_GOOGLE_CLIENT_SECRET
vercel env add VITE_GOOGLE_REDIRECT_URI
vercel env add VITE_GOOGLE_CALENDAR_ID

# 5. Deploy para produção
vercel --prod
```

**Configurações importantes:**

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Framework Preset: `Vite`

---

### 2. 🔥 **NETLIFY** (Alternativa Grátis)

**Simples e confiável para sites estáticos**

```bash
# 1. Instalar Netlify CLI
npm i -g netlify-cli

# 2. Fazer login
netlify login

# 3. Inicializar site
netlify init

# 4. Configurar build
# Build command: npm run build
# Publish directory: dist

# 5. Deploy
netlify deploy

# 6. Deploy para produção
netlify deploy --prod
```

**Arquivo `netlify.toml`:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 3. ☁️ **AWS S3 + CloudFront** (Profissional)

**Para projetos que precisam de controle total**

```bash
# 1. Build do projeto
npm run build

# 2. Subir para S3
aws s3 sync dist/ s3://seu-bucket-name --delete

# 3. Invalidar CloudFront (se configurado)
aws cloudfront create-invalidation --distribution-id XXXX --paths "/*"
```

---

### 4. 🐳 **DOCKER** (Container)

**Para ambientes corporativos**

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔧 CONFIGURAÇÕES DE PRODUÇÃO

### 1. **Variáveis de Ambiente (.env.production)**

```bash
# Supabase - Production
VITE_SUPABASE_URL=https://bzkdmmeusfxfkgbrcgvn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Calendar - Production URLs
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_REDIRECT_URI=https://seu-dominio.vercel.app/auth/google/callback
VITE_GOOGLE_CALENDAR_ID=primary
```

### 2. **URLs de Redirecionamento**

Atualizar no Google Cloud Console:

- Desenvolvimento: `http://localhost:3000/auth/google/callback`
- **Produção**: `https://seu-dominio.vercel.app/auth/google/callback`

### 3. **Domínio Personalizado (Opcional)**

```bash
# Vercel
vercel domains add beautysalon.com.br

# Netlify
netlify domains:add beautysalon.com.br
```

---

## 🔐 SEGURANÇA EM PRODUÇÃO

### 1. **Headers de Segurança**

```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 2. **HTTPS Obrigatório**

- ✅ Vercel: HTTPS automático
- ✅ Netlify: HTTPS automático
- ⚙️ AWS: Configurar CloudFront

### 3. **Rate Limiting** (Supabase)

- Configurar limites na dashboard do Supabase
- Monitorar uso da API

---

## 📊 MONITORAMENTO E ANALYTICS

### 1. **Vercel Analytics**

```bash
npm install @vercel/analytics
```

```typescript
// main.tsx
import { Analytics } from "@vercel/analytics/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
```

### 2. **Google Analytics** (Opcional)

```html
<!-- index.html -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_TRACKING_ID");
</script>
```

---

## 🔄 CI/CD AUTOMÁTICO

### 1. **GitHub Actions**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

---

## 🚀 PROCESSO DE DEPLOY RECOMENDADO

### **OPÇÃO 1: Deploy Rápido (5 minutos)**

```bash
# 1. Instalar Vercel
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
cd "c:\Users\davim\OneDrive\Área de Trabalho\SISTEMA_V2.0\beauty-salon-dashboard"
vercel

# 4. Configurar variáveis (pela interface web)
# 5. Deploy para produção
vercel --prod
```

### **OPÇÃO 2: Deploy com Domínio Personalizado**

```bash
# 1-3. Mesmo processo acima
# 4. Adicionar domínio
vercel domains add seu-dominio.com.br

# 5. Configurar DNS
# 6. Deploy final
vercel --prod
```

---

## ✅ CHECKLIST FINAL

### Antes do Deploy:

- [ ] Build funcionando: `npm run build`
- [ ] Teste local: `npm run preview`
- [ ] Variáveis de ambiente configuradas
- [ ] Database Supabase ativo
- [ ] Google APIs configuradas

### Após o Deploy:

- [ ] Teste login admin: `admin@beautysalon.com / admin123`
- [ ] Teste login recepção: `recepcao@beautysalon.com / recepcao123`
- [ ] Verificar controle de acesso (admin = 9 funcionalidades, recepção = 2)
- [ ] Testar em mobile/tablet
- [ ] Verificar HTTPS funcionando

### Monitoramento:

- [ ] Configurar alertas de erro
- [ ] Monitorar performance
- [ ] Backup database
- [ ] Documentar URLs de produção

---

## 🎯 RECOMENDAÇÃO FINAL

**Para seu projeto, recomendo o VERCEL:**

✅ **Vantagens:**

- Deploy em 2 comandos
- HTTPS automático
- CDN global
- Integração perfeita com React/Vite
- Analytics incluído
- Domínio personalizado grátis

🚀 **Comando único:**

```bash
npx vercel --prod
```

**URL final:** `https://beauty-salon-dashboard.vercel.app`

---

## 📞 SUPORTE PÓS-DEPLOY

Se algum erro ocorrer:

1. **Build errors:** `npm run build` local
2. **Environment vars:** Verificar na dashboard da plataforma
3. **Database:** Testar conexão Supabase
4. **Auth:** Verificar URLs de callback no Google

**Logs em tempo real:**

- Vercel: `vercel logs`
- Netlify: Dashboard > Functions > Logs
