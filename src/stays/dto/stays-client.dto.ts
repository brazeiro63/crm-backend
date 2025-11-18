import { StaysCliente, StaysImovel } from '../stays.service';

export interface StaysClientsResponse {
  data: StaysCliente[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface StaysPropertiesResponse {
  data: StaysImovel[];
  total?: number;
  page?: number;
  limit?: number;
}
