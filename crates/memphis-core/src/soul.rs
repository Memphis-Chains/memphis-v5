use crate::block::Block;

pub fn validate_block(block: &Block, prev: Option<&Block>) -> Result<(), Vec<String>> {
    let mut errors = vec![];

    if block.data.content.trim().is_empty() {
        errors.push("content must not be empty".to_string());
    }

    match prev {
        None => {
            if block.index != 0 {
                errors.push("genesis must have index 0".to_string());
            }
            if block.prev_hash != "0".repeat(64) {
                errors.push("genesis must have zero prev_hash".to_string());
            }
        }
        Some(p) => {
            if block.index != p.index + 1 {
                errors.push("index not sequential".to_string());
            }
            if block.prev_hash != p.hash {
                errors.push("prev_hash doesn't match previous block".to_string());
            }
            if block.timestamp < p.timestamp {
                errors.push("timestamp before previous block".to_string());
            }
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

#[cfg(test)]
mod tests {
    use super::validate_block;
    use crate::block::{Block, BlockData, BlockType};

    fn mk_block(index: u64, prev_hash: String, hash: &str, ts: &str) -> Block {
        Block {
            index,
            timestamp: ts.to_string(),
            chain: "journal".to_string(),
            data: BlockData {
                block_type: BlockType::Journal,
                content: "ok".to_string(),
                tags: vec![],
            },
            prev_hash,
            hash: hash.to_string(),
        }
    }

    #[test]
    fn genesis_requires_zero_prev_hash_and_index_zero() {
        let bad = mk_block(1, "abc".to_string(), "h1", "2026-03-08T21:00:00Z");
        let result = validate_block(&bad, None);
        assert!(result.is_err());
    }

    #[test]
    fn non_genesis_requires_sequential_index_and_prev_hash_link() {
        let genesis = mk_block(0, "0".repeat(64), "h0", "2026-03-08T21:00:00Z");
        let bad_next = mk_block(2, "wrong".to_string(), "h1", "2026-03-08T21:00:01Z");
        let result = validate_block(&bad_next, Some(&genesis));
        assert!(result.is_err());
    }
}
