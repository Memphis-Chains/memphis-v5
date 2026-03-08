import { describe, expect, it } from 'vitest';
import { AppError, toAppError } from '../../src/core/errors.js';

describe('errors mapping', () => {
  it('passes through AppError', () => {
    const err = new AppError('VALIDATION_ERROR', 'bad input', 400);
    expect(toAppError(err)).toBe(err);
  });

  it('maps provider config errors', () => {
    const mapped = toAppError(new Error('Provider not configured: x'));
    expect(mapped.code).toBe('PROVIDER_UNAVAILABLE');
    expect(mapped.statusCode).toBe(503);
  });

  it('maps unknown errors to internal', () => {
    const mapped = toAppError(new Error('random'));
    expect(mapped.code).toBe('INTERNAL_ERROR');
    expect(mapped.statusCode).toBe(500);
  });
});
