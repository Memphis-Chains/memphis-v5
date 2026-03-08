import { createRequire } from 'node:module';

export type ChainBackend = 'ts-legacy' | 'rust-napi';

export interface ChainAdapterStatus {
  backend: ChainBackend;
  rustEnabled: boolean;
  rustBridgePath?: string;
  rustBridgeLoaded: boolean;
}

interface RustBridgeLike {
  chain_append?: (chainJson: string, blockJson: string) => string;
  chain_validate?: (blockJson: string, prevJson?: string) => string;
  chain_query?: (chainJson: string, contains?: string, tag?: string) => string;
}

function parseBool(v: string | undefined, fallback = false): boolean {
  if (typeof v !== 'string') return fallback;
  return v.toLowerCase() === 'true';
}

function getRustBridgePath(rawEnv: NodeJS.ProcessEnv): string {
  return rawEnv.RUST_CHAIN_BRIDGE_PATH ?? './crates/memphis-napi';
}

function tryLoadRustBridge(rustBridgePath: string): RustBridgeLike | null {
  try {
    // Dynamic load to keep default path non-breaking when rust bridge is absent.
    const req = createRequire(`${process.cwd()}/`);
    const mod = req(rustBridgePath) as RustBridgeLike;
    return mod;
  } catch {
    return null;
  }
}

export function getChainAdapterStatus(rawEnv: NodeJS.ProcessEnv = process.env): ChainAdapterStatus {
  const rustEnabled = parseBool(rawEnv.RUST_CHAIN_ENABLED, false);
  const rustBridgePath = getRustBridgePath(rawEnv);

  if (!rustEnabled) {
    return {
      backend: 'ts-legacy',
      rustEnabled,
      rustBridgePath,
      rustBridgeLoaded: false,
    };
  }

  const bridge = tryLoadRustBridge(rustBridgePath);
  if (!bridge) {
    return {
      backend: 'ts-legacy',
      rustEnabled,
      rustBridgePath,
      rustBridgeLoaded: false,
    };
  }

  const hasCoreFns =
    typeof bridge.chain_append === 'function' &&
    typeof bridge.chain_validate === 'function' &&
    typeof bridge.chain_query === 'function';

  return {
    backend: hasCoreFns ? 'rust-napi' : 'ts-legacy',
    rustEnabled,
    rustBridgePath,
    rustBridgeLoaded: hasCoreFns,
  };
}
