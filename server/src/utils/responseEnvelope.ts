// Standard response envelope — every response (success or failure) uses this
// exact shape. See api_contracts.md §1.2. Do not construct the shape manually.

export interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface Envelope<T> {
  success: boolean;
  data: T | null;
  error: ErrorBody | null;
  statusCode: number;
}

export function successEnvelope<T>(data: T, statusCode = 200): Envelope<T> {
  return { success: true, data, error: null, statusCode };
}

export function errorEnvelope(
  code: string,
  message: string,
  statusCode: number,
  details?: unknown
): Envelope<never> {
  return {
    success: false,
    data: null,
    error: details === undefined ? { code, message } : { code, message, details },
    statusCode,
  };
}
