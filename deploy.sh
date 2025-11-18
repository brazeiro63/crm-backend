#!/bin/bash
set -e

echo "🚀 Deploy CRM Backend para VPS"
echo "================================"

# Variáveis
VPS_HOST="vps-cdm"
VPS_PATH="/home/brazeiro63/crm-backend"
STACK_NAME="crm-backend-stack"

# 1. Build da imagem Docker localmente
echo "📦 Building Docker image..."
docker build -t crm-backend:latest .

# 2. Salvar imagem para arquivo
echo "💾 Saving Docker image to file..."
docker save crm-backend:latest | gzip > crm-backend.tar.gz

# 3. Criar diretório na VPS se não existir
echo "📁 Creating directory on VPS..."
ssh $VPS_HOST "mkdir -p $VPS_PATH"

# 4. Enviar arquivos para VPS
echo "📤 Uploading files to VPS..."
scp crm-backend.tar.gz $VPS_HOST:$VPS_PATH/
scp docker-compose.yml $VPS_HOST:$VPS_PATH/
scp .env $VPS_HOST:$VPS_PATH/

# 5. Atualizar secrets na VPS
echo "🔐 Atualizando Docker secrets..."
ssh $VPS_HOST <<'ENDSSH'
set -e
cd /home/brazeiro63/crm-backend

echo "Parando stack existente..."
docker stack rm crm-backend-stack >/dev/null 2>&1 || true
sleep 5

set -a
. ./.env
set +a

create_secret() {
  local NAME="$1"
  local VALUE="$2"

  if [ -z "$VALUE" ]; then
    echo "Secret $NAME não definido em .env"
    exit 1
  fi

  if echo "$VALUE" | docker secret create "$NAME" - >/dev/null 2>&1; then
    echo "Secret $NAME criado."
    return
  fi

  docker secret rm "$NAME" >/dev/null 2>&1 || true
  echo "$VALUE" | docker secret create "$NAME" -
}

create_secret stays_login "$STAYS_LOGIN"
create_secret stays_password "$STAYS_PASSWORD"
ENDSSH

# 6. Carregar imagem no Docker da VPS
echo "📥 Loading image on VPS..."
ssh $VPS_HOST "cd $VPS_PATH && gunzip -c crm-backend.tar.gz | docker load"

# 7. Deploy no Docker Swarm
echo "🐳 Deploying to Docker Swarm..."
ssh $VPS_HOST "cd $VPS_PATH && docker stack deploy -c docker-compose.yml $STACK_NAME"

# 8. Limpar arquivos temporários
echo "🧹 Cleaning up..."
rm -f crm-backend.tar.gz
ssh $VPS_HOST "cd $VPS_PATH && rm -f crm-backend.tar.gz"

echo "✅ Deploy completed!"
echo "📊 Check status: ssh $VPS_HOST 'docker service ls | grep $STACK_NAME'"
echo "📝 Check logs: ssh $VPS_HOST 'docker service logs ${STACK_NAME}_crm-backend'"
