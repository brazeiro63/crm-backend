## Sprint Fase 1 — MVP CRM (2-3 semanas)

### Objetivo
Colocar em produção o núcleo operacional: inventário, hóspedes e pipeline de reservas sincronizados com a Stays, com visibilidade básica para o time local.

### Itens de Entrega
1. **Reservas & Pipeline**
   - Endpoint `/reservas` com CRUD + estados do fluxo (Lead → Concluído).
   - Board Kanban no frontend (drag & drop, filtros por imóvel/período/status).
   - Eventos de Stays importando reservas existentes (`/staking/booking/reservations` – confirmar payload).
2. **Sincronização Hóspedes aprimorada**
   - Import de 270 clientes via Stays.
   - Normalização de tags, score e origem de cada lead.
   - Tela listando históricos e notas internas.
3. **WhatsApp MCP (básico)**
   - Configurar endpoints para receber/registrar conversas via MCP (dois números Business).
   - Tela única mostrando timeline das mensagens por hóspede e botão manual de envio (templates: confirmação/check-in/check-out/review).
4. **Checklist Operacional**
   - Estrutura de tarefas simples: limpeza, vistoria, manutenção.
   - Associação automática aos eventos de check-out/check-in (usando cron básico).
   - UI simplificada no CRM indicando tarefas do dia por responsável.

### Dependências & Pré-requisitos
- Confirmar payloads dos endpoints Stays (reservas/listing) e JSON dos webhooks.
- Validar formato dos eventos MCP e autenticação dos dois números.
- Definir responsáveis por imóvel (já cadastrados) para atrelar tarefas.

### Critérios de Aceite
- Operação consegue ver todas as reservas futuras em um quadro único.
- Importações de clientes/reservas podem ser disparadas on-demand e rodar em background.
- Usuário CRM consegue responder manualmente pelo WhatsApp sem sair da plataforma.
- Para todo check-out registrado, há tarefa de limpeza criada automaticamente e com status acompanhável.

### Próximos Passos Imediatos
1. Definir payloads com Stays (docs/Swagger) para reservas e webhooks.
2. Mapear endpoints MCP disponíveis e criar DTOs no backend.
3. Criar modelo Prisma para `Reserva` e `Tarefa`, com migração planejada.
4. Levantar UI necessária no frontend (páginas `/crm/reservas` e `/crm/tarefas`).
