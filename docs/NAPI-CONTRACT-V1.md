# NAPI-CONTRACT-V1.md

Real-deal.

## Scope
Minimal NAPI bridge contract for Phase 0 entry.

## Functions

### 1) `chain_validate(block_json, prev_json?) -> string(JSON)`
Validates one block against optional previous block.

Input:
- `block_json`: serialized `Block`
- `prev_json`: optional serialized previous `Block`

Output JSON:
- success envelope: `{ ok: true, data: { valid: boolean, errors?: string[] } }`
- parse error envelope: `{ ok: false, error: "..." }`

---

### 2) `chain_append(chain_json, block_json) -> string(JSON)`
Validates and appends block to in-memory chain array.

Input:
- `chain_json`: serialized `Block[]`
- `block_json`: serialized `Block`

Output JSON:
- `{ ok: true, data: { appended: boolean, length: number, chain?: Block[], errors?: string[] } }`
- parse error envelope on invalid payloads

---

### 3) `chain_query(chain_json, contains?, tag?) -> string(JSON)`
Simple filter query over chain array.

Input:
- `chain_json`: serialized `Block[]`
- `contains`: optional content substring (case-insensitive)
- `tag`: optional exact tag match (case-insensitive)

Output JSON:
- `{ ok: true, data: { count: number, blocks: Block[] } }`
- parse error envelope on invalid payloads

## Notes
- Contract is intentionally thin and JSON-based for early interoperability.
- Persistence and richer query semantics are out of v1 scope.
- This contract is non-breaking as long as envelope keys remain (`ok`, `data`, `error`).
