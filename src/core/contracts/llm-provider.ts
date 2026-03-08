import type { GenerateInput, GenerateResult, ProviderHealth, ProviderName } from '../types.js';

export interface LLMProvider {
  readonly name: ProviderName;

  healthCheck(): Promise<ProviderHealth>;

  generate(input: GenerateInput): Promise<GenerateResult>;
}
