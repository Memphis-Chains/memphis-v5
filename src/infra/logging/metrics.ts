export type ProviderMetric = {
  provider: string;
  success: number;
  failure: number;
  totalLatencyMs: number;
  calls: number;
};

class InMemoryMetrics {
  private providerStats = new Map<string, ProviderMetric>();

  public recordProviderCall(provider: string, ok: boolean, latencyMs: number): void {
    const prev = this.providerStats.get(provider) ?? {
      provider,
      success: 0,
      failure: 0,
      totalLatencyMs: 0,
      calls: 0,
    };

    prev.calls += 1;
    prev.totalLatencyMs += latencyMs;
    if (ok) prev.success += 1;
    else prev.failure += 1;

    this.providerStats.set(provider, prev);
  }

  public snapshot() {
    const providers = [...this.providerStats.values()].map((p) => ({
      ...p,
      avgLatencyMs: p.calls > 0 ? Math.round(p.totalLatencyMs / p.calls) : 0,
    }));

    return {
      ts: new Date().toISOString(),
      providers,
    };
  }
}

export const metrics = new InMemoryMetrics();
