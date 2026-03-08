import { z } from 'zod';

export const usageSchema = z.object({
  inputTokens: z.number().int().nonnegative().optional(),
  outputTokens: z.number().int().nonnegative().optional(),
});

export const generateResponseSchema = z.object({
  id: z.string().min(1),
  providerUsed: z.enum(['shared-llm', 'decentralized-llm', 'local-fallback']),
  modelUsed: z.string().min(1).optional(),
  output: z.string().min(1),
  usage: usageSchema.optional(),
  timingMs: z.number().int().nonnegative(),
});

export const providersHealthResponseSchema = z.object({
  defaultProvider: z.enum(['shared-llm', 'decentralized-llm', 'local-fallback']),
  providers: z.array(
    z.object({
      name: z.enum(['shared-llm', 'decentralized-llm', 'local-fallback']),
      ok: z.boolean(),
      latencyMs: z.number().int().nonnegative().optional(),
      error: z.string().optional(),
    }),
  ),
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;
