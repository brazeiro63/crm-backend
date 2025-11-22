## Sprint Fase 1 — MVP CRM (2-3 semanas)

### Objetivo
Colocar em produção o núcleo operacional: inventário, hóspedes e pipeline de reservas sincronizados com a Stays, com visibilidade básica para o time local.

### Itens de Entrega
1. **Reservas & Pipeline**
   - ✅ Endpoint `/reservas` com CRUD + estados do fluxo (Lead → Concluído).
   - ✅ Board em `/crm/reservas` mostrando pipeline (filtros básicos).
   - 🔄 Integrar com API Stays para importar reservas em lote e manter pipeline atualizado automaticamente.
2. **Sincronização Hóspedes aprimorada**
   - Import de 270 clientes via Stays.
   - Normalização de tags, score e origem de cada lead.
   - Tela listando históricos e notas internas.
3. **WhatsApp MCP (básico)**
   - Configurar endpoints/backend para receber/registrar conversas via MCP (dois números Business).
   - Tela única mostrando timeline das mensagens por hóspede e botão manual de envio (templates: confirmação/check-in/check-out/review).
4. **Checklist Operacional**
   - Estrutura de tarefas simples: limpeza, vistoria, manutenção.
   - Associação automática aos eventos de check-out/check-in (usando cron básico).
   - UI simplificada no CRM indicando tarefas do dia por responsável.

### Dependências & Pré-requisitos
- ✅ Confirmar payloads dos endpoints Stays (reservas/listing) e JSON dos webhooks.
- Validar formato dos eventos MCP e autenticação dos dois números.
- Definir responsáveis por imóvel (já cadastrados) para atrelar tarefas.

### Critérios de Aceite
- Operação consegue ver todas as reservas futuras em um quadro único (em progresso, faltam drag&drop e sincronização automática).
- Importações de clientes/reservas podem ser disparadas on-demand e rodar em background.
- Usuário CRM consegue responder manualmente pelo WhatsApp sem sair da plataforma.
- Para todo check-out registrado, há tarefa de limpeza criada automaticamente e com status acompanhável.

### Próximos Passos Imediatos
1. Integrar o serviço `StaysService.listReservas` ao pipeline para importar reservas reais (cron + botão de sync).
2. Desenhar modelo/serviço de tarefas operacionais (`Tarefa`) e telas de checklist.
3. Mapear endpoints MCP disponíveis e criar DTOs no backend.
4. Levantar UI necessária para `/crm/tarefas` e integrar com WhatsApp básico.
