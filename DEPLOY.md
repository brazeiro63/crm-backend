# 🚀 Guia de Deploy - CRM Backend

## 📋 Pré-requisitos

- SSH configurado com chave (`vps-cdm`)
- Docker instalado localmente
- Variáveis de ambiente configuradas em `.env`

## 🧪 Deploy de Desenvolvimento

```bash
./deploy-dev.sh
```

**URL:** https://api-crm-dev.casasdemargarida.com.br/api

## 🚀 Deploy de Produção

```bash
./deploy.sh
```

**URL:** https://api-crm.casasdemargarida.com.br/api

## 📊 Comandos Úteis

### Ver status dos serviços
```bash
ssh vps-cdm 'docker service ls | grep crm'
```

### Ver logs do backend (dev)
```bash
ssh vps-cdm 'docker service logs -f crm-stack-dev_crm-backend-dev'
```

### Ver logs do backend (prod)
```bash
ssh vps-cdm 'docker service logs -f crm-stack_crm-backend'
```

### Remover stack (dev)
```bash
ssh vps-cdm 'docker stack rm crm-stack-dev'
```

### Remover stack (prod)
```bash
ssh vps-cdm 'docker stack rm crm-stack'
```

### Escalar serviço
```bash
ssh vps-cdm 'docker service scale crm-stack_crm-backend=2'
```

### Ver detalhes do serviço
```bash
ssh vps-cdm 'docker service inspect crm-stack_crm-backend'
```

### Atualizar apenas uma configuração (sem rebuild)
```bash
ssh vps-cdm 'docker service update --env-add NEW_VAR=value crm-stack_crm-backend'
```

### Forçar atualização (pull nova imagem)
```bash
ssh vps-cdm 'docker service update --force crm-stack_crm-backend'
```

## 🗄️ Banco de Dados

### Conectar ao PostgreSQL
```bash
ssh vps-cdm 'docker exec -it f706dc9c291d psql -U postgres -d crm'
```

### Backup do banco
```bash
ssh vps-cdm 'docker exec f706dc9c291d pg_dump -U postgres crm' > backup-$(date +%Y%m%d).sql
```

### Restaurar backup
```bash
cat backup.sql | ssh vps-cdm 'docker exec -i f706dc9c291d psql -U postgres -d crm'
```

### Ver tabelas
```bash
ssh vps-cdm 'docker exec -i f706dc9c291d psql -U postgres -d crm -c "\dt"'
```

## 🔍 Troubleshooting

### Backend não inicia
```bash
# Ver logs detalhados
ssh vps-cdm 'docker service logs --tail 100 crm-stack_crm-backend'

# Ver tasks do serviço
ssh vps-cdm 'docker service ps crm-stack_crm-backend'
```

### Erro de conexão com banco
```bash
# Verificar se o banco está acessível
ssh vps-cdm 'docker exec -it f706dc9c291d psql -U postgres -c "\l"'

# Testar conexão da rede CDMNet
ssh vps-cdm 'docker run --rm --network CDMNet postgres:14 psql -h postgres -U postgres -c "SELECT 1"'
```

### Limpar imagens antigas
```bash
ssh vps-cdm 'docker image prune -a -f'
```

## 📝 Workflow Recomendado

1. **Desenvolvimento Local**
   ```bash
   npm run start:dev
   ```

2. **Teste Local**
   ```bash
   npm run build
   npm run start:prod
   ```

3. **Deploy Dev**
   ```bash
   ./deploy-dev.sh
   # Testar em https://api-crm-dev.casasdemargarida.com/api
   ```

4. **Deploy Produção**
   ```bash
   ./deploy.sh
   # Verificar em https://api-crm.casasdemargarida.com/api
   ```

## 🔐 Variáveis de Ambiente

Certifique-se de que `.env` está configurado antes do deploy:

```env
DATABASE_URL="postgresql://postgres:SENHA@postgres:5432/crm?schema=public"
REDIS_URL="redis://redis:6379"
JWT_SECRET="sua-chave-super-secreta"
# ... outras variáveis
```

## 🌐 URLs

- **API Dev:** https://api-crm-dev.casasdemargarida.com.br/api
- **API Prod:** https://api-crm.casasdemargarida.com.br/api
- **Frontend:** https://contratos.casasdemargarida.com
