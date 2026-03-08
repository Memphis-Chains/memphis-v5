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

    if errors.is_empty() { Ok(()) } else { Err(errors) }
}
