DO $$
BEGIN
  CREATE TYPE "ReservaStatus" AS ENUM ('LEAD', 'ORCAMENTO', 'AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'CHECKIN_AGENDADO', 'ATIVO', 'CHECKOUT', 'CONCLUIDO', 'CANCELADO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDENTE', 'PAGO', 'PARCIAL', 'ATRASADO', 'ESTORNADO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TYPE "BookingSource" AS ENUM ('AIRBNB', 'BOOKING', 'DIRETO', 'EXPEDIA', 'OUTRO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TYPE "TarefaTipo" AS ENUM ('LIMPEZA', 'MANUTENCAO', 'VISTORIA', 'OUTRA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TYPE "TarefaStatus" AS ENUM ('PENDENTE', 'EM_PROGRESSO', 'CONCLUIDA', 'CANCELADA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE IF NOT EXISTS "reservas" (
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

CREATE TABLE IF NOT EXISTS "tarefas" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "reservas_staysReservaId_key" ON "reservas"("staysReservaId");
CREATE INDEX IF NOT EXISTS "reservas_imovel_idx" ON "reservas"("imovelId");
CREATE INDEX IF NOT EXISTS "reservas_cliente_idx" ON "reservas"("clienteId");
CREATE INDEX IF NOT EXISTS "reservas_status_idx" ON "reservas"("status");
CREATE INDEX IF NOT EXISTS "reservas_payment_status_idx" ON "reservas"("paymentStatus");
CREATE INDEX IF NOT EXISTS "reservas_origem_idx" ON "reservas"("origem");
CREATE INDEX IF NOT EXISTS "reservas_checkin_idx" ON "reservas"("checkIn");
CREATE INDEX IF NOT EXISTS "tarefas_imovel_idx" ON "tarefas"("imovelId");
CREATE INDEX IF NOT EXISTS "tarefas_reserva_idx" ON "tarefas"("reservaId");
CREATE INDEX IF NOT EXISTS "tarefas_status_idx" ON "tarefas"("status");
CREATE INDEX IF NOT EXISTS "tarefas_tipo_idx" ON "tarefas"("tipo");

ALTER TABLE "reservas"
  ADD CONSTRAINT IF NOT EXISTS "reservas_imovelId_fkey"
    FOREIGN KEY ("imovelId") REFERENCES "imoveis_crm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reservas"
  ADD CONSTRAINT IF NOT EXISTS "reservas_clienteId_fkey"
    FOREIGN KEY ("clienteId") REFERENCES "clientes_crm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tarefas"
  ADD CONSTRAINT IF NOT EXISTS "tarefas_imovelId_fkey"
    FOREIGN KEY ("imovelId") REFERENCES "imoveis_crm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tarefas"
  ADD CONSTRAINT IF NOT EXISTS "tarefas_reservaId_fkey"
    FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
