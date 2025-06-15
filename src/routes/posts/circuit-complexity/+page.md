---
layout: post
title: "Introduction To Circuit Complexity"
description: "On the Power and Importance of Boolean Function Analysis, and Why It Is So Hard?"
published: 2025-06-15
tags: ["#SoME4", "Theoretical Computer Science"]
---

<script lang="ts">
    import Ref from "$lib/Ref.svelte";
    import ReferencesList from "$lib/ReferencesList.svelte";

    let references = [];
</script>

Circuit complexity is a subbranch of computational complexity theory that
studies how simple or efficient a process can be when broken down into its most
basic steps.
At its heart, the main question in circuit complexity is this: *How simple can a
computation be?* More specifically, if you have a function that takes a bunch of
binary (yes/no) inputs and produces a binary output, how few logical steps (gates)
do you need to compute it? Some functions are easy, and you can compute them with
just a few gates; but others seem to require much more! The mystery is that, for
many functions, we still don't know how simple they could be, or if there's a
clever trick we’re missing.<Ref
    title="Circuit Complexity"
    people="Wikipedia"
    url="https://en.wikipedia.org/wiki/Circuit_complexity"
    references={references}
/>

I first came across circuit complexity just a few weeks ago, and I was immediately hooked;
The field has surprisingly deep and far-reaching implications, yet many of its most basic and fundamental questions remain open!
Moreover, the models and problems are very *pure* - easy to grasp, experiment with, and surprisingly rich in depth.

In this blog post I will try to introduce you to the field, and will walk you
through the definitions, methods, main results and open problems, and implications.
I also try to reference as much sources as possible for you to explore on your
own. Hopefully, my excitement for this topic rubs off on you. Happy reading!

## The Boolean Function

A *boolean function* is a function $f : \{0,1\}^n \to \{0, 1\}$, which
intuitively takes $n$ bits as inputs, and outputs a single bit.
We usually denote the input bits as $x_1, x_2, ..., x_n$, and say that an input
bit $x_i$ is *on* if $x_i = 1$, or *off* if $x_i = 0$.

Examples of such functions are

$$
\oplus_n(x) \coloneqq \sum_{i=1}^n{x_i} \mod 2
$$

which outputs 1 if and only if the number of on inputs bits is odd (and is
usually called the *parity* function),<Ref
    title="Parity function"
    url="https://en.wikipedia.org/wiki/Parity_function"
    people="Wikipedia"
    references={references}
/> and

$$
\text{Th}^n_k(x) =
    \begin{cases}
        1 & \text{if } \sum_{i=1}^n x_i \ge k \\
        0 & \text{if } \sum_{i=1}^n x_i < k
    \end{cases}
$$

which outputs 1 if and only if the number of on inputs bits is greater than some
constant $k$ (The $\text{Th}$ stands for *Threshold*).

Notice boolean functions can also represent much more complex properties. For
example, given a graph with $v$ vertices, we can describe a boolean function
with $n = \binom{v}{2}$ inputs, one bit for each possible edge, where the output
is $1$ if and only if some property of the input graph holds. One, commonly
mentioned example is the $\text{CLIQUE}_k(x)$ function, which outputs $1$ if
and only if the provided graph has a subgraph which is a clique of size $k$.
Note that this problem is a $\textsf{NP-Complete}$ problem, which in simple
terms means that it is widely believed that finding the answer is computationally hard.<Ref
    title="Clique problem"
    url="https://en.wikipedia.org/wiki/Clique_problem"
    people="Wikipedia"
    references={references}
/>

One final note is that the model above can be extended to functions that output
multiple bits.
Given a function $f^n_m : \{0, 1\}^n \to \{0, 1\}^m$, we can define $m$ different
functions $f_1, f_2, \dots, f_m$ where each $f_i : \{0, 1\}^n \to \{0, 1\}$ is
defined such that $f_i(x) = 1$ if and only if the $i$-th bit of $f^n_m(x)$ is 1.
An example of such function, with multiple outputs bits, is
$\text{FACTOR}_n : \{0, 1\}^n \to \{0, 1\}^n$,
that takes a binary vector $(x_1, x_2, \dots, x_n)$, which represents the binary
encoded integer $x^\star = \sum_{i=1}^n x_i 2^{i-1}$, and a outputs an $n$ bit
binary encoded integer which represents the smallest prime factor of $x^\star$,
(or 1 if $x^\star$ is prime).<Ref
    title="Integer factorization"
    url="https://en.wikipedia.org/wiki/Integer_factorization"
    people="Wikipedia"
    references={references}
/>
Notice that $\text{FACTOR}_n$ is well-defined, and factoring large numbers is widely believed to be hard in general: many cryptographic systems rely on this hardness to ensure their security.<Ref
    title="RSA cryptosystem"
    url="https://en.wikipedia.org/wiki/RSA_cryptosystem"
    people="Wikipedia"
    references={references}
/>

## The Boolean Circuit

A *boolean circuit*

## Why Upper Bounds Are Important?

### Efficiency of Computation

## Why Lower Bounds Are Important?

### Cryptographic Implications

- Primes factorization.
- Reverse Hashing.
- Reverse Encryption.

## What Do We Know So Far?

### $2^n / n$ Average Complexity

### Only Linear Explicit Lower Bounds

### Monotone Bounds

### Slice Bounds

## Why Lower Bounds Are Hard?

### The Complexity Of Not Gates

## Connection To Classical Computational Theory

On $\textsf{P}/\textsf{poly}$.

## References and Further Reading

<ReferencesList {references}/>
