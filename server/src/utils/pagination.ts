export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationQuery {
  const page = Math.max(1, parseInt(String(query.page ?? "1"), 10) || 1);
  const raw = parseInt(String(query.limit ?? "20"), 10) || 20;
  const limit = Math.min(100, Math.max(1, raw));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function buildPagination(total: number, page: number, limit: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.ceil(total / limit) || 1 };
}

export function paginatedData<T>(items: T[], total: number, page: number, limit: number) {
  return { items, pagination: buildPagination(total, page, limit) };
}
