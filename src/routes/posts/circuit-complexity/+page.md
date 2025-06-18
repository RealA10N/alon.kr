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

    import EyeCatcher from "./lib/EyeCatcher.svelte";
    import Circuit from "./lib/Circuit.svelte";
    import GatesView from "./lib/GatesView.svelte";

    let references = [];

</script>

Circuit complexity is a subbranch of computational complexity theory that studies how simple or efficient a process can be when broken down into its most basic steps.

<EyeCatcher />

More specifically, if you have a function that takes a bunch of binary (yes/no) inputs and produces a binary output, how few logical steps (gates) do you need to compute it? Some functions are easy, and you can compute them with just a few gates; but others seem to require much more! The mystery is that, for
many functions, we still don't know how simple they could be, or if there's a clever trick we’re missing.<Ref
    title="Circuit Complexity"
    people="Wikipedia"
    url="https://en.wikipedia.org/wiki/Circuit_complexity"
    references={references}
/>

I first came across circuit complexity just a few weeks ago, and I was immediately
hooked;
The field has surprisingly deep and far-reaching implications, yet many of its
most basic and fundamental questions remain open!
Moreover, the models and problems are very *pure* - easy to grasp, experiment
with, and surprisingly rich in depth.

In this blog post I will try to introduce you to the field, and will walk you
through the definitions, methods, main results, open problems, and implications.
I intentionally avoid getting bogged down in technicalities; my goal is to
convey the core ideas and intuition, rather than be perfectly rigorous.
I also try to reference as much sources as possible for you to explore on your
own. Hopefully, my excitement for this topic rubs off on you. Happy reading!

## The Boolean Function

A *boolean function* is a function $f : \{0,1\}^n \to \{0, 1\}$, which
intuitively takes $n$ bits as inputs, and outputs a single bit.
We usually denote the input vector as $x = (x_1, x_2, ..., x_n)$, where $x_i$ is
the $i$-th input bit.
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
constant $k$ (The *"Th"* stands for *Threshold*).

### Non-Trivial Boolean Functions

Notice boolean functions can also represent much more complex properties. For
example, given a graph with $v$ vertices, we can describe a boolean function
with $n = \binom{v}{2}$ inputs, one input bit for each possible edge, where the
output is 1 if and only if some property of the input graph holds.
One, commonly mentioned example is the $\text{CLIQUE}_k(x)$ function, which outputs
1 if and only if the provided graph has a clique subgraph of size $k$.
This problem is *NP-Complete*, which in simple terms means that it
is widely believed that finding the answer is computationally hard.<Ref
    title="Clique problem"
    url="https://en.wikipedia.org/wiki/Clique_problem"
    people="Wikipedia"
    references={references}
/>

The model described above can also be extended to functions that output multiple bits.
Given a function $f^n_m : \{0, 1\}^n \to \{0, 1\}^m$, we can define $m$ different
functions $f_1, f_2, \dots, f_m$ where each $f_i : \{0, 1\}^n \to \{0, 1\}$ is
defined such that $f_i(x) = 1$ if and only if the $i$-th bit of $f^n_m(x)$ is 1.
I will use $y = (y_1, y_2, \dots, y_m)$ to denote the output vector of such
functions, where $y_i$ is the $i$-th output bit.
A particularly interesting example of a function with multiple outputs bits is
$\text{FACTOR}_n : \{0, 1\}^n \to \{0, 1\}^n$,
that takes a binary vector $(x_1, x_2, \dots, x_n)$, that represents the binary
encoded integer $x^\star = \sum_{i=1}^n x_i 2^{i-1}$, and outputs a similarly
encoded integer $y^\star = \sum_{i=1}^n y_i 2^{i-1}$, where $y^\star$ is the
smallest prime factor of $x^\star$ (or $1$ if $x^\star$ is prime).<Ref
    title="Integer factorization"
    url="https://en.wikipedia.org/wiki/Integer_factorization"
    people="Wikipedia"
    references={references}
/>
Notice that $\text{FACTOR}_n$ is well-defined, and factoring large numbers is
widely believed to be hard in general: many cryptographic systems rely on this
hardness to ensure their security.<Ref
    title="RSA cryptosystem"
    url="https://en.wikipedia.org/wiki/RSA_cryptosystem"
    people="Wikipedia"
    references={references}
/>

## The Boolean Circuit

Intuitively, a *boolean circuit* is a description of a computation of a large
boolean function $f : \{0, 1\}^n \to \{0,1\}$, that meticulously concatenates
the outputs of *weaker* boolean functions $g : \{0, 1\}^k \to \{0, 1\}$, which
we call *gates*. The number of input bits $k$ in a given gate is sometimes called
the *fanin* or *in-degree* of the gate, and for the purpose of this post, all
gates are of fanin of at most 2.
It is easy to show that there are $2^{2^k}$ different gates of *fanin* $k$, and
in particular, there are exactly $2^{2^2} = 16$ unique gates with two inputs.

<GatesView />

Notice that out of the 16 gates of *fanin-2*, only <a>10 gates</a> depend on
both inputs, <a>2 gates</a> depend strictly on $x_1$, <a>another 2</a> depends
only on $x_2$, and the final <a>2 gates</a> depend on no inputs, and their outputs
are constant. Hence, this family of gates actually encapsulates all gates of
*fanin* $\le 2$.

We call a collection $\Phi$ of boolean functions a *basis*.
Then, a *circuit* $C$ over $\Phi$ is a directed acyclic graph $G = (V, E)$
where all nodes $v \in V$ with $\deg_\text{in}(v) = 0$ are labeled by a variable
$(x_1, x_2, \dots)$, and are called the *inputs* of the circuit.
Every other node $u \in V$ is labeled by a function (gate) from $\Phi$ of
$\deg_\text{in}(u)$ variables.
In addition, nodes $w \in V$ where $\deg_\text{out}(w) = 0$ are called the *outputs*
of the circuit and are labeled by $(y_1, y_2, \dots)$.<Ref
    title="Boolean Circuit Complexity: Lecture Notes"
    people="Uri Zwick, Omer Shibolet"
    url="https://www.cs.tau.ac.il//~zwick/scribe-boolean.html"
    references={references}
/>

<Circuit />

### Complete Bases

### Notes on Other Models

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

<Ref
    title="Boolean Function Complexity: Advances and Frontiers"
    url="https://www.doi.org/10.1007/978-3-642-24508-4"
    people="Stasys Jukna"
    references={references}
/>

<ReferencesList {references}/>
