use crate::block::{Block, BlockData};
use crate::soul::validate_block;

pub struct MemoryChain {
    pub name: String,
    pub blocks: Vec<Block>,
}

impl MemoryChain {
    pub fn new(name: impl Into<String>) -> Self {
        Self { name: name.into(), blocks: vec![] }
    }

    pub fn append(&mut self, block: Block) -> Result<(), Vec<String>> {
        let prev = self.blocks.last();
        validate_block(&block, prev)?;
        self.blocks.push(block);
        Ok(())
    }

    pub fn len(&self) -> usize {
        self.blocks.len()
    }

    pub fn tail(&self, n: usize) -> Vec<&Block> {
        self.blocks.iter().rev().take(n).collect()
    }

    #[allow(dead_code)]
    pub fn append_data_placeholder(&mut self, _data: BlockData) {
        // reserved for next slice
    }
}
