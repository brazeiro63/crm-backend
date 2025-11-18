#!/bin/bash
set -e

echo "🧪 Deploy CRM Backend DEV para VPS"
echo "===================================="

# Variáveis
VPS_HOST="vps-cdm"
VPS_PATH="/home/brazeiro63/crm-backend-dev"
STACK_NAME="crm-backend-stack-dev"

# 1. Build da imagem Docker
echo "📦 Building Docker image..."
docker build -t crm-backend:dev .

# 2. Salvar imagem
echo "💾 Saving Docker image..."
docker save crm-backend:dev | gzip > crm-backend-dev.tar.gz

# 3. Criar diretório na VPS
echo "📁 Creating directory on VPS..."
ssh $VPS_HOST "mkdir -p $VPS_PATH"

# 4. Enviar arquivos
echo "📤 Uploading files..."
scp crm-backend-dev.tar.gz $VPS_HOST:$VPS_PATH/
scp docker-compose.dev.yml $VPS_HOST:$VPS_PATH/
scp .env $VPS_HOST:$VPS_PATH/

# 5. Atualizar secrets na VPS
echo "🔐 Atualizando Docker secrets..."
ssh $VPS_HOST <<'ENDSSH'
set -e
cd /home/brazeiro63/crm-backend-dev

echo "Parando stack existente..."
docker stack rm crm-backend-stack-dev >/dev/null 2>&1 || true
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

# 6. Carregar imagem
echo "📥 Loading image on VPS..."
ssh $VPS_HOST "cd $VPS_PATH && gunzip -c crm-backend-dev.tar.gz | docker load"

# 7. Deploy
echo "🐳 Deploying to Docker Swarm..."
ssh $VPS_HOST "cd $VPS_PATH && docker stack deploy -c docker-compose.dev.yml $STACK_NAME"

# 8. Limpar
echo "🧹 Cleaning up..."
rm -f crm-backend-dev.tar.gz
ssh $VPS_HOST "cd $VPS_PATH && rm -f crm-backend-dev.tar.gz"

echo "✅ DEV Deploy completed!"
echo "🌐 API Dev: https://api-crm-dev.casasdemargarida.com.br/api"
echo "📊 Status: ssh $VPS_HOST 'docker service ls | grep $STACK_NAME'"
