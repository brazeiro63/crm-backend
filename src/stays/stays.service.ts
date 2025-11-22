import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import {
  StaysClientsResponse,
  StaysPropertiesResponse,
} from './dto/stays-client.dto';

export interface StaysCliente {
  _id: string;
  kind: string;
  fName: string;
  lName: string;
  email: string;
  isUser: boolean;
}

export interface StaysClienteDetalhado {
  _id: string;
  kind: string;
  fName: string;
  lName: string;
  email: string;
  isUser: boolean;
  phones?: Array<{
    num?: string;
    iso?: string;
    hint?: string;
  }>;
  documents?: Array<{
    type: string;
    numb: string;
  }>;
  alternateLangs?: string[];
  lastAccess?: {
    _dt: string;
    ip: string;
    ua: string;
    device: string;
  };
  reservations?: Array<{
    _id: string;
    id: string;
    checkInDate: string;
    checkInTime: string;
    checkOutDate: string;
    checkOutTime: string;
    _idlisting: string;
    _idclient: string;
    type: string;
    currency: string;
    price: {
      _f_total: number;
    };
    guests: number;
  }>;
}

export interface StaysClientesFilters {
  hasReservations?: boolean;
  reservationFilter?: 'arrival' | 'departure';
  reservationFrom?: string; // YYYY-MM-DD
  reservationTo?: string; // YYYY-MM-DD
}

export interface StaysImovel {
  _id: string;
  _idowner?: string;
  _idproperty?: string;
  name?: string;
  internalName?: string;
  title?: string;
  displayName?: string;
  unitName?: string;
  _mstitle?: {
    pt_BR?: string;
    en_US?: string;
    [key: string]: string | undefined;
  };
  shortDescription?: string;
  description?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    zipcode?: string;
  };
  characteristics?: string[];
  amenities?: string[];
  capacity?: number;
  _i_maxGuests?: number;
  rooms?: number;
  bathrooms?: number;
  area?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaysImovelBooking {
  _id: string;
  _idproperty?: string;
  name?: string;
  internalName?: string;
  title?: string;
  displayName?: string;
  unitName?: string;
  _mstitle?: {
    pt_BR?: string;
    en_US?: string;
    [key: string]: string | undefined;
  };
  capacity?: number;
  maxGuests?: number;
  _i_maxGuests?: number;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    zipcode?: string;
  };
}

export interface StaysProperty {
  _id: string;
  name?: string;
  title?: string;
  displayName?: string;
  _mstitle?: {
    pt_BR?: string;
    en_US?: string;
    [key: string]: string | undefined;
  };
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    zipcode?: string;
  };
}

export interface StaysReservationPriceDetails {
  currency?: string;
  _f_total?: number;
  hostingDetails?: {
    fees?: Array<{ name?: string; _f_val?: number }>;
    discounts?: Array<{ name?: string; _f_val?: number }>;
    _f_nightPrice?: number;
    _f_total?: number;
  };
  extrasDetails?: {
    fees?: Array<{ name?: string; _f_val?: number }>;
    extraServices?: Array<{ name?: string; _f_val?: number }>;
    discounts?: Array<{ name?: string; _f_val?: number }>;
    _f_total?: number;
  };
}

export interface StaysReservation {
  _id: string;
  id?: string;
  creationDate?: string;
  checkInDate?: string;
  checkInTime?: string;
  checkOutDate?: string;
  checkOutTime?: string;
  _idlisting?: string;
  _idclient?: string;
  type?: string;
  agent?: {
    _id?: string;
    name?: string;
  };
  price?: StaysReservationPriceDetails;
  stats?: {
    _f_totalPaid?: number;
  };
  guests?: number;
  guestsDetails?: {
    adults?: number;
    children?: number;
    infants?: number;
  };
  partner?: {
    _id?: string;
    name?: string;
    commission?: {
      type?: string;
    };
  };
  reservationUrl?: string;
}

export interface StaysReservationsFilters {
  from: string;
  to: string;
  dateType: 'arrival' | 'departure' | 'creation';
  listingId?: string;
  type?: string;
  clientId?: string;
  skip?: number;
  limit?: number;
}

@Injectable()
export class StaysService {
  private readonly apiUrl: string;
  private readonly authHeader: string;
  private readonly logger = new Logger(StaysService.name);

  constructor(private configService: ConfigService) {
    const staysUrl = this.normalizeApiUrl(
      this.configService.get<string>('STAYS_API_URL'),
    );
    this.apiUrl = staysUrl ?? 'https://brazeiro.stays.net/external/v1';

    const login = this.getSecretValue('STAYS_LOGIN');
    const password = this.getSecretValue('STAYS_PASSWORD');

    if (!login || !password) {
      throw new Error(
        'STAYS_LOGIN e STAYS_PASSWORD devem ser configurados no .env',
      );
    }

    const credentials = Buffer.from(`${login}:${password}`).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  private normalizeApiUrl(value?: string | null): string | null {
    if (!value) {
      return null;
    }

    try {
      const trimmed = value.trim();
      const url = new URL(trimmed);
      url.pathname = '/external/v1';
      url.search = '';
      url.hash = '';
      return url.toString().replace(/\/$/, '');
    } catch {
      this.logger.warn(
        `STAYS_API_URL inválida (${value}). Usando URL padrão do serviço.`,
      );
      return null;
    }
  }

  private getSecretValue(envKey: string): string {
    const directValue = this.configService.get<string>(envKey);
    if (directValue) {
      return directValue;
    }

    const filePath = this.configService.get<string>(`${envKey}_FILE`);
    if (filePath) {
      try {
        return readFileSync(filePath, 'utf8').trim();
      } catch {
        throw new Error(
          `Não foi possível ler o secret ${envKey}_FILE: ${filePath}`,
        );
      }
    }

    return '';
  }

  async listClientes(filters?: StaysClientesFilters): Promise<StaysCliente[]> {
    try {
      const url = new URL(`${this.apiUrl}/booking/clients`);

      if (filters) {
        if (filters.hasReservations !== undefined) {
          url.searchParams.append(
            'hasReservations',
            String(filters.hasReservations),
          );
        }
        if (filters.reservationFilter) {
          url.searchParams.append(
            'reservationFilter',
            filters.reservationFilter,
          );
        }
        if (filters.reservationFrom) {
          url.searchParams.append('reservationFrom', filters.reservationFrom);
        }
        if (filters.reservationTo) {
          url.searchParams.append('reservationTo', filters.reservationTo);
        }
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new HttpException(
          `Erro ao buscar clientes da Stays: ${response.statusText}`,
          response.status,
        );
      }

      const data = (await response.json()) as StaysCliente[];
      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro ao conectar com API Stays',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listReservas(
    filters: StaysReservationsFilters,
  ): Promise<StaysReservation[]> {
    if (!filters?.from || !filters?.to || !filters?.dateType) {
      throw new HttpException(
        'Parâmetros from, to e dateType são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    const url = new URL(`${this.apiUrl}/booking/reservations`);
    url.searchParams.append('from', filters.from);
    url.searchParams.append('to', filters.to);
    url.searchParams.append('dateType', filters.dateType);

    if (filters.listingId) {
      url.searchParams.append('listingId', filters.listingId);
    }

    if (filters.type) {
      url.searchParams.append('type', filters.type);
    }

    if (filters.clientId) {
      url.searchParams.append('_idclient', filters.clientId);
    }

    if (typeof filters.skip === 'number') {
      url.searchParams.append('skip', String(filters.skip));
    }

    if (typeof filters.limit === 'number') {
      url.searchParams.append('limit', String(filters.limit));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new HttpException(
        `Erro ao buscar reservas da Stays: ${response.statusText}`,
        response.status,
      );
    }

    const data = (await response.json().catch(() => null)) as
      | StaysReservation[]
      | null;

    if (!Array.isArray(data)) {
      throw new HttpException(
        'Resposta inválida da Stays ao listar reservas',
        HttpStatus.BAD_GATEWAY,
      );
    }

    return data;
  }

  async getClienteById(id: string): Promise<StaysClienteDetalhado | null> {
    try {
      const url = `${this.apiUrl}/booking/clients/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new HttpException(
          `Erro ao buscar cliente da Stays: ${response.statusText}`,
          response.status,
        );
      }

      const data = (await response.json()) as StaysClienteDetalhado;
      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro ao conectar com API Stays',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listClientesPaginated(
    skip = 0,
    limit = 100,
  ): Promise<StaysClientsResponse> {
    const url = new URL(`${this.apiUrl}/booking/clients`);
    url.searchParams.set('skip', String(skip));
    url.searchParams.set('limit', String(limit));

    this.logger.debug(`Fetching Stays clients skip=${skip}, limit=${limit}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new HttpException(
        `Erro ao paginar clientes da Stays: ${response.statusText}`,
        response.status,
      );
    }

    const payload = (await response.json()) as
      | StaysCliente[]
      | StaysClientsResponse;
    if (Array.isArray(payload)) {
      const data: StaysCliente[] = payload;
      return {
        data,
        total: data.length,
        page: Math.floor(skip / limit) + 1,
        limit,
      };
    }
    return payload;
  }

  async listImoveisPaginated(
    skip = 0,
    limit = 100,
  ): Promise<StaysPropertiesResponse> {
    const url = new URL(`${this.apiUrl}/content/listings`);
    url.searchParams.set('skip', String(skip));
    url.searchParams.set('limit', String(limit));

    this.logger.debug(`Fetching Stays listings skip=${skip}, limit=${limit}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new HttpException(
        `Erro ao paginar imóveis da Stays: ${response.statusText}`,
        response.status,
      );
    }

    const payload = (await response.json()) as
      | StaysImovel[]
      | StaysPropertiesResponse;
    if (Array.isArray(payload)) {
      const data: StaysImovel[] = payload;
      return {
        data,
        total: data.length,
        page: Math.floor(skip / limit) + 1,
        limit,
      };
    }
    return payload;
  }

  async getImovelDetalhes(id: string): Promise<StaysImovel | null> {
    try {
      const url = `${this.apiUrl}/content/listings/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new HttpException(
          `Erro ao buscar imóvel ${id} na Stays: ${response.statusText}`,
          response.status,
        );
      }

      const data = (await response.json()) as StaysImovel;
      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Erro ao conectar com API Stays ao buscar imóvel ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getImovelBookingDetalhes(
    id: string,
  ): Promise<StaysImovelBooking | null> {
    try {
      const url = `${this.apiUrl}/booking/listings/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new HttpException(
          `Erro ao buscar informações de booking do imóvel ${id}: ${response.statusText}`,
          response.status,
        );
      }

      const data = (await response.json()) as StaysImovelBooking;
      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Erro ao conectar com API Stays ao buscar informações de booking do imóvel ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getImovelPropertyDetalhes(id: string): Promise<StaysProperty | null> {
    try {
      const url = `${this.apiUrl}/content/properties/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new HttpException(
          `Erro ao buscar propriedade ${id} na Stays: ${response.statusText}`,
          response.status,
        );
      }

      const data = (await response.json()) as StaysProperty;
      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Erro ao conectar com API Stays ao buscar propriedade ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
