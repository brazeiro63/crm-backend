# CRM Backend - Casas de Margarida

Backend do sistema CRM integrado ao gerador de contratos.

## 🚀 Stack Tecnológico

- **Framework:** NestJS  
- **Linguagem:** TypeScript  
- **ORM:** Prisma  
- **Banco de Dados:** PostgreSQL  
- **Cache:** Redis  
- **Autenticação:** JWT  
- **Containerização:** Docker + Docker Swarm  
- **Proxy Reverso:** Traefik

## 📦 Pré-requisitos

- Node.js 20+
- Docker + Docker Swarm
- PostgreSQL 14 rodando no Docker
- Redis rodando no Docker
- Rede Docker `CDMNet` configurada

## 🛠️ Instalação Local

### 1. Clonar e instalar dependências

```bash
cd crm-backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env com suas configurações
```

### 3. Gerar Prisma Client

```bash
npx prisma generate
```

### 4. Criar banco de dados

Conecte-se ao PostgreSQL e crie o database:

```sql
CREATE DATABASE crm;
```

### 5. Executar migrações

```bash
npx prisma migrate dev --name init
```

### 6. Iniciar em desenvolvimento

```bash
npm run start:dev
```

Servidor rodando em: `http://localhost:3001/api`

## 🐳 Deploy com Docker

### Desenvolvimento

```bash
# Build da imagem
docker build -t crm-backend:dev .

# Deploy no Swarm (dev)
docker stack deploy -c docker-compose.dev.yml crm-stack-dev
```

Acessível em: `https://api-crm-dev.casasdemargarida.com.br/api`

### Produção

```bash
# Build da imagem
docker build -t crm-backend:latest .

# Deploy no Swarm (produção)
docker stack deploy -c docker-compose.yml crm-stack
```

Acessível em: `https://api-crm.casasdemargarida.com.br/api`

## 📊 Prisma

### Comandos úteis

```bash
# Gerar Client
npx prisma generate

# Criar migração
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações em produção
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio

# Formatar schema
npx prisma format

# Validar schema
npx prisma validate
```

## 🗂️ Estrutura do Banco de Dados

### Entidades Principais

- **Usuario**: Usuários do sistema (ADMIN, GERENTE, OPERADOR)
- **ClienteCRM**: Clientes enriquecidos com dados além da Stays
- **ContratoGerado**: Histórico de contratos gerados
- **Interacao**: Interações com clientes (email, telefone, etc)
- **ImovelCRM**: Dados operacionais de imóveis
- **StaysCache**: Cache de dados da API Stays

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL do PostgreSQL | `postgresql://user:pass@host:5432/crm` |
| `REDIS_URL` | URL do Redis | `redis://redis:6379` |
| `JWT_SECRET` | Chave secreta JWT | `your-secret-key` |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `7d` |
| `PORT` | Porta do servidor | `3001` |
| `FRONTEND_URL` | URL do frontend (dev) | `http://localhost:3000` |
| `FRONTEND_URL_PROD` | URL do frontend (prod) | `https://contratos.casasdemargarida.com` |
| `STAYS_API_URL` | URL da API Stays | `https://api.stays.com.br` |
| `STAYS_API_KEY` | Chave da API Stays | `your-api-key` |

## 📡 Endpoints

Base URL: `/api`

### Health Check
- `GET /api` - Retorna "Hello World!" (teste)

### Futuros Módulos (a implementar)
- `/api/auth` - Autenticação
- `/api/users` - Usuários
- `/api/clients` - Clientes
- `/api/contracts` - Contratos
- `/api/interactions` - Interações
- `/api/properties` - Imóveis
- `/api/stays` - Integração Stays

## 🔧 Scripts NPM

```json
{
  "start": "node dist/main",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "build": "nest build",
  "format": "prettier --write \"src/**/*.ts\"",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage"
}
```

## 📝 Roadmap

### Fase 2 (Atual) - Setup Básico ✅
- [x] Projeto NestJS criado
- [x] Prisma configurado
- [x] Schema do banco criado
- [x] Docker + Docker Compose
- [x] Integração com Traefik
- [x] CORS configurado

### Fase 3 - Integração Stays API
- [ ] Cliente HTTP para Stays
- [ ] Cache inteligente (Redis)
- [ ] Sincronização de dados
- [ ] Endpoints de proxy

### Fase 4 - Módulo de Autenticação
- [ ] JWT Strategy
- [ ] Login/Registro
- [ ] Guards e Decorators
- [ ] Refresh Tokens

### Fase 5 - Módulo de Clientes
- [ ] CRUD de clientes
- [ ] Tags e scoring
- [ ] Busca e filtros
- [ ] Integração com Stays

### Fase 6 - Módulo de Contratos
- [ ] Migrar geração de PDFs
- [ ] Armazenamento de PDFs
- [ ] Histórico
- [ ] Vínculo com Stays

### Fase 7 - Módulo de Interações
- [ ] CRUD de interações
- [ ] Timeline de cliente
- [ ] Anexos
- [ ] Notificações

### Fase 8 - Analytics
- [ ] Dashboard
- [ ] KPIs
- [] Relatórios
- [ ] Exportação

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
2. Commit suas mudanças (`git commit -m 'Add nova feature'`)
3. Push para a branch (`git push origin feature/nova-feature`)
4. Abra um Pull Request

## 📄 Licença

Propriedade de Casas de Margarida Administração de Imóveis Ltda.
