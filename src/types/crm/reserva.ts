export type ReservaStatus =
  | 'LEAD'
  | 'ORCAMENTO'
  | 'AGUARDANDO_PAGAMENTO'
  | 'CONFIRMADO'
  | 'CHECKIN_AGENDADO'
  | 'ATIVO'
  | 'CHECKOUT'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type PaymentStatus =
  | 'PENDENTE'
  | 'PAGO'
  | 'PARCIAL'
  | 'ATRASADO'
  | 'ESTORNADO';

export type BookingSource =
  | 'AIRBNB'
  | 'BOOKING'
  | 'DIRETO'
  | 'EXPEDIA'
  | 'OUTRO';

export interface ReservaClienteInfo {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  emails?: string[];
  telefones?: string[];
  documentos?: Array<{ tipo?: string; numero?: string }>;
  origem?: string | null;
  tags: string[];
}

export interface ReservaImovelInfo {
  id: string;
  nome: string;
  tipo: string;
  endereco: string;
  responsavelLocal?: string | null;
  responsavelContato?: string | null;
}

export interface Reserva {
  id: string;
  staysReservaId?: string | null;
  status: ReservaStatus;
  paymentStatus: PaymentStatus;
  origem: BookingSource;
  canal?: string | null;
  checkIn: string;
  checkOut: string;
  totalHospedes: number;
  valorTotal?: number | null;
  sinal?: number | null;
  observacoes?: string | null;
  notasInternas?: string | null;
  pipelinePosicao: number;
  createdAt: string;
  updatedAt: string;
  imovel: ReservaImovelInfo;
  cliente: ReservaClienteInfo;
}

export interface ReservasResponse {
  data: Reserva[];
  meta: {
    skip: number;
    take: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ReservasFilters {
  skip?: number;
  take?: number;
  status?: ReservaStatus;
  paymentStatus?: PaymentStatus;
  origem?: BookingSource;
  imovelId?: string;
  clienteId?: string;
  checkInFrom?: string;
  checkInTo?: string;
}
