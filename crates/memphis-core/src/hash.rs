use crate::block::Block;
use sha2::{Digest, Sha256};

pub fn compute_hash(block: &Block) -> String {
    let payload = serde_json::to_vec(block).unwrap_or_default();
    let mut hasher = Sha256::new();
    hasher.update(payload);
    format!("{:x}", hasher.finalize())
}
