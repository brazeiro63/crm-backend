export interface StaysPaginationParams {
  page?: number;
  limit?: number;
}

export interface StaysPaginatedResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
