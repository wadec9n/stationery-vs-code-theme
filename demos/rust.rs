//! Generic ring buffer with a typed iterator and a tiny error type.
//!
//! Demonstrates traits, lifetimes, generics, enums, pattern matching,
//! `impl` blocks, derive macros, and the `?` operator.

use std::fmt::{self, Display};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BufferError {
    Empty,
    OutOfBounds { index: usize, len: usize },
}

impl Display for BufferError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BufferError::Empty => write!(f, "buffer is empty"),
            BufferError::OutOfBounds { index, len } => {
                write!(f, "index {index} out of bounds (len = {len})")
            }
        }
    }
}

impl std::error::Error for BufferError {}

#[derive(Debug)]
pub struct RingBuffer<T, const N: usize> {
    data: [Option<T>; N],
    head: usize,
    len: usize,
}

impl<T, const N: usize> Default for RingBuffer<T, N> {
    fn default() -> Self {
        Self {
            data: std::array::from_fn(|_| None),
            head: 0,
            len: 0,
        }
    }
}

impl<T, const N: usize> RingBuffer<T, N> {
    pub fn new() -> Self {
        Self::default()
    }

    pub const fn capacity(&self) -> usize {
        N
    }

    pub fn len(&self) -> usize {
        self.len
    }

    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    /// Push an item, evicting the oldest when full.
    pub fn push(&mut self, item: T) -> Option<T> {
        let slot = (self.head + self.len) % N;
        let evicted = self.data[slot].take();
        self.data[slot] = Some(item);

        if self.len == N {
            self.head = (self.head + 1) % N;
        } else {
            self.len += 1;
        }
        evicted
    }

    pub fn pop(&mut self) -> Result<T, BufferError> {
        if self.is_empty() {
            return Err(BufferError::Empty);
        }
        let item = self.data[self.head].take().ok_or(BufferError::Empty)?;
        self.head = (self.head + 1) % N;
        self.len -= 1;
        Ok(item)
    }

    pub fn iter(&self) -> RingIter<'_, T, N> {
        RingIter { buf: self, pos: 0 }
    }
}

pub struct RingIter<'a, T, const N: usize> {
    buf: &'a RingBuffer<T, N>,
    pos: usize,
}

impl<'a, T, const N: usize> Iterator for RingIter<'a, T, N> {
    type Item = &'a T;

    fn next(&mut self) -> Option<Self::Item> {
        if self.pos >= self.buf.len {
            return None;
        }
        let idx = (self.buf.head + self.pos) % N;
        self.pos += 1;
        self.buf.data[idx].as_ref()
    }
}

fn main() -> Result<(), BufferError> {
    let mut rb: RingBuffer<&str, 3> = RingBuffer::new();
    for word in ["alpha", "beta", "gamma", "delta"] {
        if let Some(evicted) = rb.push(word) {
            println!("evicted: {evicted}");
        }
    }

    let joined: Vec<_> = rb.iter().collect();
    println!("contents = {joined:?}");

    while !rb.is_empty() {
        let item = rb.pop()?;
        println!("popped: {item}");
    }
    Ok(())
}
