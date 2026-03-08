import { describe, expect, it } from 'vitest';
import { loadConfig } from '../../src/infra/config/env.js';

describe('loadConfig', () => {
  it('loads valid local-fallback config', () => {
    const cfg = loadConfig({
      NODE_ENV: 'development',
      HOST: '127.0.0.1',
      PORT: '3000',
      LOG_LEVEL: 'debug',
      DEFAULT_PROVIDER: 'local-fallback',
      LOCAL_FALLBACK_ENABLED: 'true',
      GEN_TIMEOUT_MS: '30000',
      GEN_MAX_TOKENS: '512',
      GEN_TEMPERATURE: '0.4',
      DATABASE_URL: 'file:./data/test.db',
    });

    expect(cfg.DEFAULT_PROVIDER).toBe('local-fallback');
    expect(cfg.PORT).toBe(3000);
  });

  it('fails when shared provider missing required keys', () => {
    expect(() =>
      loadConfig({
        NODE_ENV: 'development',
        HOST: '127.0.0.1',
        PORT: '3000',
        LOG_LEVEL: 'debug',
        DEFAULT_PROVIDER: 'shared-llm',
        GEN_TIMEOUT_MS: '30000',
        GEN_MAX_TOKENS: '512',
        GEN_TEMPERATURE: '0.4',
        DATABASE_URL: 'file:./data/test.db',
      }),
    ).toThrow(/SHARED_LLM_API_BASE|SHARED_LLM_API_KEY/);
  });
});
