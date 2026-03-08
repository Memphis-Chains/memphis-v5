use thiserror::Error;

#[derive(Debug, Error)]
pub enum MemphisError {
    #[error("invalid block: {0}")]
    InvalidBlock(String),
}
