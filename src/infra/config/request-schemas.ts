import { z } from 'zod';

export const chatGenerateSchema = z.object({
  input: z.string().min(1).max(20000),
  provider: z.enum(['auto', 'shared-llm', 'decentralized-llm', 'local-fallback']).optional(),
  model: z.string().min(1).max(200).optional(),
  sessionId: z.string().min(1).max(200).optional(),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().int().min(1).max(32768).optional(),
      timeoutMs: z.number().int().min(100).max(120000).optional(),
    })
    .optional(),
});
