import type {
  ReservasResponse,
  ReservasFilters,
  Reserva,
} from '../../types/crm/reserva.js';

const RESERVAS_ENDPOINT = '/reservas';

const buildQuery = (filters: ReservasFilters = {}): string => {
  const params = new URLSearchParams();

  if (filters.skip !== undefined) params.append('skip', String(filters.skip));
  if (filters.take !== undefined) params.append('take', String(filters.take));
  if (filters.status) params.append('status', filters.status);
  if (filters.paymentStatus)
    params.append('paymentStatus', filters.paymentStatus);
  if (filters.origem) params.append('origem', filters.origem);
  if (filters.imovelId) params.append('imovelId', filters.imovelId);
  if (filters.clienteId) params.append('clienteId', filters.clienteId);
  if (filters.checkInFrom) params.append('checkInFrom', filters.checkInFrom);
  if (filters.checkInTo) params.append('checkInTo', filters.checkInTo);

  return params.toString();
};

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const reservasApi = {
  list: async (
    filters: ReservasFilters = {},
    baseUrl = '',
  ): Promise<ReservasResponse> => {
    const query = buildQuery(filters);
    const url = `${baseUrl}${RESERVAS_ENDPOINT}${query ? `?${query}` : ''}`;
    return fetchApi<ReservasResponse>(url);
  },

  findOne: async (id: string, baseUrl = ''): Promise<Reserva> => {
    const url = `${baseUrl}${RESERVAS_ENDPOINT}/${id}`;
    return fetchApi<Reserva>(url);
  },
};
