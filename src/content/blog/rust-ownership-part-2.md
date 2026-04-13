---
title: "Understanding Rust Ownership: Borrowing & References"
description: "How Rust lets you use values without transferring ownership — references, borrowing rules, and the borrow checker."
pubDate: 2026-04-12
tags: ["rust", "systems-programming", "beginner"]
series: "Understanding Rust Ownership"
seriesPart: 2
featured: false
draft: false
---

In [part 1](/blog/rust-ownership-part-1), we covered ownership and move semantics. Moving ownership everywhere is limiting — you'd have to return values from every function just to use them again. Borrowing solves this.

## References

A reference lets you refer to a value without taking ownership:

```rust
fn main() {
    let s = String::from("hello");
    let len = calculate_length(&s); // borrow s
    println!("{} has length {}", s, len); // s still valid
}

fn calculate_length(s: &String) -> usize {
    s.len()
} // s goes out of scope, but we don't own it — nothing is dropped
```

The `&` creates a reference. The function borrows the value but doesn't own it, so the original variable remains valid after the call.

## The rules

Rust enforces two borrowing rules at compile time:

1. You can have **any number of immutable references** (`&T`) at the same time.
2. You can have **exactly one mutable reference** (`&mut T`) — and no immutable references at the same time.

```rust
let mut s = String::from("hello");

let r1 = &s;     // ok
let r2 = &s;     // ok — multiple immutable refs allowed
let r3 = &mut s; // ERROR — can't mutate while immutable refs exist
```

## Why these rules?

They prevent data races at compile time. A data race happens when:
- Two pointers access the same data simultaneously
- At least one is writing
- There's no synchronization

Rust's borrow rules make data races impossible in safe code. This is the core of what "fearless concurrency" means.

## Lifetimes (preview)

References have lifetimes — the scope during which they're valid. Usually the compiler infers them. When it can't, you annotate them explicitly. That's part 3.
