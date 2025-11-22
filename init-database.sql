-- CRM Database Migration - Initial Schema
-- Execute este arquivo no PostgreSQL da VPS

-- Criar ENUMs
CREATE TYPE "Papel" AS ENUM ('ADMIN', 'GERENTE', 'OPERADOR');
CREATE TYPE "TipoContrato" AS ENUM ('ADMINISTRACAO_IMOVEL', 'LOCACAO_TEMPORADA');
CREATE TYPE "StatusContrato" AS ENUM ('RASCUNHO', 'GERADO', 'ASSINADO', 'CANCELADO');
CREATE TYPE "TipoInteracao" AS ENUM ('EMAIL', 'TELEFONE', 'WHATSAPP', 'PRESENCIAL', 'NOTA');
CREATE TYPE "CategoriaInteracao" AS ENUM ('DUVIDA', 'RECLAMACAO', 'ELOGIO', 'SUPORTE', 'COMERCIAL');
CREATE TYPE "TipoStaysCache" AS ENUM ('CLIENTE', 'RESERVA', 'IMOVEL');
CREATE TYPE "ImovelStatus" AS ENUM ('DISPONIVEL', 'OCUPADO', 'MANUTENCAO', 'LIMPEZA');
CREATE TYPE "ReservaStatus" AS ENUM ('LEAD', 'ORCAMENTO', 'AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'CHECKIN_AGENDADO', 'ATIVO', 'CHECKOUT', 'CONCLUIDO', 'CANCELADO');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDENTE', 'PAGO', 'PARCIAL', 'ATRASADO', 'ESTORNADO');
CREATE TYPE "BookingSource" AS ENUM ('AIRBNB', 'BOOKING', 'DIRETO', 'EXPEDIA', 'OUTRO');
CREATE TYPE "TarefaTipo" AS ENUM ('LIMPEZA', 'MANUTENCAO', 'VISTORIA', 'OUTRA');
CREATE TYPE "TarefaStatus" AS ENUM ('PENDENTE', 'EM_PROGRESSO', 'CONCLUIDA', 'CANCELADA');

-- Tabela de Usuários
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "papel" "Papel" NOT NULL DEFAULT 'OPERADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcesso" TIMESTAMP(3),
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- Tabela de Clientes CRM
CREATE TABLE "clientes_crm" (
    "id" TEXT NOT NULL,
    "staysClientId" TEXT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "tags" TEXT[],
    "score" INTEGER NOT NULL DEFAULT 0,
    "preferencias" JSONB,
    "observacoes" TEXT,
    "origem" TEXT,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaAtualizacao" TIMESTAMP(3) NOT NULL,
    "ultimaReserva" TIMESTAMP(3),
    "totalReservas" INTEGER NOT NULL DEFAULT 0,
    "valorTotalGasto" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "clientes_crm_pkey" PRIMARY KEY ("id")
);

-- Tabela de Contratos Gerados
CREATE TABLE "contratos_gerados" (
    "id" TEXT NOT NULL,
    "tipo" "TipoContrato" NOT NULL,
    "clienteId" TEXT NOT NULL,
    "staysReservaId" TEXT,
    "dadosContrato" JSONB NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "status" "StatusContrato" NOT NULL DEFAULT 'RASCUNHO',
    "geradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geradoPor" TEXT NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "contratos_gerados_pkey" PRIMARY KEY ("id")
);

-- Tabela de Interações
CREATE TABLE "interacoes" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "contratoId" TEXT,
    "tipo" "TipoInteracao" NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" "CategoriaInteracao" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradoPor" TEXT NOT NULL,
    "anexos" TEXT[],

    CONSTRAINT "interacoes_pkey" PRIMARY KEY ("id")
);

-- Tabela de Imóveis CRM
CREATE TABLE "imoveis_crm" (
    "id" TEXT NOT NULL,
    "staysImovelId" TEXT,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "status" "ImovelStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "responsavelLocal" TEXT,
    "responsavelContato" TEXT,
    "comodidades" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "fotos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "instrucoes" JSONB,
    "historicoManutencao" JSONB[],
    "custosOperacionais" JSONB[],
    "documentacao" TEXT[],
    "observacoes" TEXT,
    "ultimaVistoria" TIMESTAMP(3),
    "proximaManutencao" TIMESTAMP(3),
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaAtualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imoveis_crm_pkey" PRIMARY KEY ("id")
);

-- Tabela de Cache Stays
CREATE TABLE "stays_cache" (
    "id" TEXT NOT NULL,
    "tipo" "TipoStaysCache" NOT NULL,
    "staysId" TEXT NOT NULL,
    "dados" JSONB NOT NULL,
    "ultimaSync" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proximaSync" TIMESTAMP(3) NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "stays_cache_pkey" PRIMARY KEY ("id")
);

-- Tabela de Reservas
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "staysReservaId" TEXT,
    "imovelId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "status" "ReservaStatus" NOT NULL DEFAULT 'LEAD',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDENTE',
    "origem" "BookingSource" NOT NULL DEFAULT 'DIRETO',
    "canal" TEXT,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "totalHospedes" INTEGER NOT NULL DEFAULT 1,
    "valorTotal" DECIMAL(10,2),
    "sinal" DECIMAL(10,2),
    "observacoes" TEXT,
    "notasInternas" TEXT,
    "pipelinePosicao" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- Tabela de Tarefas Operacionais
CREATE TABLE "tarefas" (
    "id" TEXT NOT NULL,
    "tipo" "TarefaTipo" NOT NULL,
    "status" "TarefaStatus" NOT NULL DEFAULT 'PENDENTE',
    "descricao" TEXT,
    "imovelId" TEXT,
    "reservaId" TEXT,
    "responsavel" TEXT,
    "responsavelContato" TEXT,
    "dataPrevista" TIMESTAMP(3),
    "dataConclusao" TIMESTAMP(3),
    "checklist" JSONB,
    "fotos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefas_pkey" PRIMARY KEY ("id")
);

-- Criar Índices Únicos
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
CREATE UNIQUE INDEX "clientes_crm_staysClientId_key" ON "clientes_crm"("staysClientId");
CREATE UNIQUE INDEX "clientes_crm_cpf_key" ON "clientes_crm"("cpf");
CREATE UNIQUE INDEX "imoveis_crm_staysImovelId_key" ON "imoveis_crm"("staysImovelId");
CREATE UNIQUE INDEX "stays_cache_tipo_staysId_key" ON "stays_cache"("tipo", "staysId");
CREATE UNIQUE INDEX "reservas_staysReservaId_key" ON "reservas"("staysReservaId");
CREATE INDEX "reservas_imovel_idx" ON "reservas"("imovelId");
CREATE INDEX "reservas_cliente_idx" ON "reservas"("clienteId");
CREATE INDEX "reservas_status_idx" ON "reservas"("status");
CREATE INDEX "reservas_payment_status_idx" ON "reservas"("paymentStatus");
CREATE INDEX "reservas_origem_idx" ON "reservas"("origem");
CREATE INDEX "reservas_checkin_idx" ON "reservas"("checkIn");
CREATE INDEX "tarefas_imovel_idx" ON "tarefas"("imovelId");
CREATE INDEX "tarefas_reserva_idx" ON "tarefas"("reservaId");
CREATE INDEX "tarefas_status_idx" ON "tarefas"("status");
CREATE INDEX "tarefas_tipo_idx" ON "tarefas"("tipo");

-- Criar Foreign Keys
ALTER TABLE "contratos_gerados" ADD CONSTRAINT "contratos_gerados_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_crm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contratos_gerados" ADD CONSTRAINT "contratos_gerados_geradoPor_fkey" FOREIGN KEY ("geradoPor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_crm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "contratos_gerados"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "interacoes" ADD CONSTRAINT "interacoes_registradoPor_fkey" FOREIGN KEY ("registradoPor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis_crm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes_crm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis_crm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Criar tabela de migrations do Prisma
CREATE TABLE "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- Registrar esta migration
INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "applied_steps_count") 
VALUES (
    gen_random_uuid()::text,
    'initial_schema',
    '20250114000000_init',
    1
);

COMMENT ON DATABASE crm IS 'CRM - Casas de Margarida - Database initialized';
