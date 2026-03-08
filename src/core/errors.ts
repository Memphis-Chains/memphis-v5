export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_RATE_LIMIT'
  | 'CONFIG_ERROR'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, statusCode: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof Error && /Provider not configured/i.test(error.message)) {
    return new AppError('PROVIDER_UNAVAILABLE', error.message, 503);
  }

  return new AppError('INTERNAL_ERROR', 'Internal server error', 500);
}
