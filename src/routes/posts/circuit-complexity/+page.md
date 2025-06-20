---
layout: post
title: "Introduction To Circuit Complexity"
description: "On the Power and Importance of Boolean Function Analysis, and why it is so Hard?"
published: 2025-06-18
tags: ["#SoME4", "Theoretical Computer Science"]
---

<script lang="ts">
    import Ref from "$lib/Ref.svelte";
    import ReferencesList from "$lib/ReferencesList.svelte";

    import EyeCatcher from "./lib/EyeCatcher.svelte";
    import Th2Circuit from "./lib/Th2Circuit.svelte";
    import GatesView from "./lib/GatesView.svelte";

    let references = [];

    let highlightDependentOnBothVariables: () => any;
    let highlightDependentOnX1: () => any;
    let highlightDependentOnX2: () => any;
    let highlightConstants: () => any;
</script>

Circuit complexity is a subbranch of computational complexity theory that studies how simple or efficient a process can be when broken down into its most basic steps.

<EyeCatcher />

More specifically, if you have a function that takes a bunch of binary (yes/no) inputs and produces a binary output, how few logical steps (gates) do you need to compute it?
Some functions are easy, and you can compute them with just a few gates; but others seem to require much more!
The mystery is that, for many functions, we still don't know how simple they could be, or if there's a clever trick we’re missing.<Ref title="Circuit Complexity" people="Wikipedia" url="https://en.wikipedia.org/wiki/Circuit_complexity" references={references} />

I first came across circuit complexity just a few weeks ago, and I was immediately hooked;
The field has surprisingly deep and far-reaching implications, yet many of its most basic and fundamental questions remain open!
Moreover, the models and problems are very *pure* - easy to grasp, experiment with, and surprisingly rich in depth.

In this blog post I will try to introduce you to the field, and will walk you through the definitions, methods, main results, open problems, and implications.
I intentionally avoid getting bogged down in technicalities; my goal is to convey the core ideas and intuition, rather than be perfectly rigorous.
Happy reading!

## The Boolean Function

A *boolean function* is a function $f : \{0,1\}^n \to \{0, 1\}$, which intuitively takes $n$ bits as inputs, and outputs a single bit.
We usually denote the input vector as $x = (x_1, x_2, ..., x_n)$, where $x_i$ is the $i$-th input bit.
Examples of such functions are

$$
\oplus_n(x) \coloneqq \sum_{i=1}^n{x_i} \mod 2
$$

which outputs 1 if and only if the number of on inputs bits is odd (and is usually called the *parity* function),<Ref title="Parity function" url="https://en.wikipedia.org/wiki/Parity_function" people="Wikipedia" references={references} /> and

$$
\text{Th}^n_k(x) =
    \begin{cases}
        1 & \text{if } \sum_{i=1}^n x_i \ge k \\
        0 & \text{if } \sum_{i=1}^n x_i < k
    \end{cases}
$$

which outputs 1 if and only if the number of on inputs bits is greater than some constant $k$ (The *"Th"* stands for *Threshold*).

### Non-Trivial Boolean Functions

Boolean functions can also represent much more complex properties.
For example, given a graph with $v$ vertices, we can describe a boolean function with $n = \binom{v}{2}$ inputs, one input bit for each possible edge, where the output is 1 if and only if some property of the input graph holds.
One, commonly mentioned example is the $\text{CLIQUE}_k(x)$ function, which outputs 1 if and only if the provided graph has a clique subgraph of size $k$.
This problem is *NP-Complete*, which in simple terms means that it is widely believed that finding the answer is computationally hard.<Ref title="Clique problem" url="https://en.wikipedia.org/wiki/Clique_problem" people="Wikipedia" references={references} />

The model described above can also be extended to functions that output multiple bits.
Given a function $f : \{0, 1\}^n \to \{0, 1\}^m$, we can define $m$ different functions $f_1, f_2, \dots, f_m$ where each $f_i : \{0, 1\}^n \to \{0, 1\}$ is defined such that $f_i(x) = 1$ if and only if the $i$-th bit of $f(x)$ is 1.
I will use $y = (y_1, y_2, \dots, y_m)$ to denote the output vector of such functions, where $y_i$ is the $i$-th output bit.
A particularly interesting example of a function with multiple outputs bits is $\text{FACTOR}_n : \{0, 1\}^n \to \{0, 1\}^n$, that takes a binary vector $(x_1, x_2, \dots, x_n)$, that encodes a binary integer $x^\star = \sum_{i=1}^n x_i 2^{i-1}$, and outputs a similarly encoded integer $y^\star = \sum_{i=1}^n y_i 2^{i-1}$, where $y^\star$ is the smallest prime factor of $x^\star$ (or 1 if $x^\star$ is prime).<Ref title="Integer factorization" url="https://en.wikipedia.org/wiki/Integer_factorization" people="Wikipedia" references={references} />
Notice that $\text{FACTOR}_n$ is well-defined, and factoring large numbers is widely believed to be hard in general: many cryptographic systems rely on this hardness to ensure their security.<Ref title="RSA cryptosystem" url="https://en.wikipedia.org/wiki/RSA_cryptosystem" people="Wikipedia" references={references} />

## The Boolean Circuit

Intuitively, a *boolean circuit* is a description of a computation of a large boolean function $f : \{0, 1\}^n \to \{0,1\}$, that meticulously concatenates the outputs of *weaker* boolean functions $g : \{0, 1\}^k \to \{0, 1\}$, which we call *gates*.
The number of input bits $k$ in a given gate is sometimes called the *fanin* or *in-degree* of the gate, and for the purpose of this post, all gates are of fanin of at most 2.
It is easy to show that there are $2^{2^k}$ different gates of *fanin* $k$, and in particular, there are exactly $2^{2^2} = 16$ unique gates with two inputs.

<GatesView bind:highlightDependentOnBothVariables bind:highlightDependentOnX1 bind:highlightDependentOnX2 bind:highlightConstants />

Notice that out of the 16 gates of *fanin-2*, only <a on:click={highlightDependentOnBothVariables}>10 gates</a> depend on both inputs, <a on:click={highlightDependentOnX1}>2 gates</a> depend strictly on $x_1$, <a on:click={highlightDependentOnX2}>another 2</a> depends only on $x_2$, and the final <a on:click={highlightConstants}>2 gates</a> depend on no inputs, and their outputs are constant.
Hence, this family of gates actually encapsulates all gates of *fanin* $\le 2$.

We call a collection $\Phi$ of boolean functions a *basis*.
Then, a *circuit* $C$ over $\Phi$ is a directed acyclic graph $G = (V, E)$ where all nodes $v \in V$ with $\deg_\text{in}(v) = 0$ are labeled by a variable $(x_1, x_2, \dots)$, and are called the *inputs* of the circuit.
Every other node $u \in V$ is labeled by a function (gate) from $\Phi$ of $\deg_\text{in}(u)$ variables.
In addition, nodes $w \in V$ where $\deg_\text{out}(w) = 0$ are called the *outputs* of the circuit and are labeled by $(y_1, y_2, \dots)$.<Ref title="Boolean Circuit Complexity: Lecture Notes" people="Uri Zwick, Omer Shibolet" url="https://www.cs.tau.ac.il//~zwick/scribe-boolean.html" references={references} />

<Th2Circuit />

### Computation of the Circuit

The *value* $g_v(x)$ of a node $v \in V$ on input $x = (x_1, x_2 \dots, x_n)$, is defined inductively:

- If $v$ is labeled by an input variable $x_i$, then simply $g_v(x) = x_i$.
- Otherwise, let $\varphi \in \Phi$ be the function labeled by $v$, and let $\text{pred}(v) = (u_1, u_2, \dots)$ be the nodes with incoming edges to $v$.
Then, $g_v(x) = \varphi(g_{u_1}(x), g_{u_2}(x), \dots)$.

Intuitively, to compute the value of an internal node $v$, we first compute
the value of all of it's predecessors $\text{pred}(v)$, and then apply the
corresponding gate function $\varphi$ on the computed value of the predecessors.
Since the graph is acyclic, this process always terminates.
Finally, we say that the circuit $C$ computes $f$ if for all input vectors $x$,
the value of the output node $g_w(x)$ equals to $f(x)$.

### Complete Bases

Recall that a basis $\Phi$ is a collection of gates (boolean functions).
We say that a basis $\Phi$ is *complete* if for every boolean function $f$ (with any number of variables) there exists a circuit $C_\Phi^f$ that computes the function $f$ over the basis $\Phi$.
<!-- 
It is easy to see that the basis $\{\wedge, \vee, \neg\}$ is complete;
One can take any boolean function $f$, look at it's truth table, and construct a circuit that represents the CNF<Ref title="Conjunctive normal form" people="Wikipedia" url="https://en.wikipedia.org/wiki/Conjunctive_normal_form" references={references} /> -->

## Measuring Circuit Complexity

It is common to measure the *complexity* of a circuit using two different metrics.

1. The first is the *size* of a circuit, measured by the *number of gates* in it. This measure is fairly straightforward: if we stick with the analogy of gates as very simple pieces of logic, then the more gates a circuit has, the more complex the functions it can represent. When talking about hardware circuits, this directly correlates to the cost, and size, of the corresponding hardware.
2. The second one is called the *depth* of the circuit, and is the length of the longest path in the circuit. Intuitively, this measure indicates how *parallelizable* the computation is. With real hardware as an analogy, this correlates to how fast the computation can be performed.

We denote by $C_\Phi(f)$ and $D_\Phi(f)$ the minimal size and depth, respectively, across all circuits that computes $f$ over $\Phi$. The main point of interest in circuit complexity is the behavior of those complexity measures on different functions and families of functions. Mainly, one can ask itself:

- Are there families of functions that require super-polynomial size or depth?
- Can we prove strong lower bounds on circuit size or depth for explicit functions?
- Are there functions which are small in size, but *very sequential* (i.e. require large depth)?
- Are there functions which are *highly parallelizable* (i.e. have low depth) but still require large size?
- How do restrictions on the circuit model affect complexity?
- And many more!

## Why Upper Bounds Are Important?

### Efficiency of Computation

## Why Lower Bounds Are Important?

### Cryptographic Implications

- Primes factorization.
- Reverse Hashing.
- Reverse Encryption.

## Almost All Functions Are Complex

A primary result that ignited Circuit Complexity as a field of study came from Shannon in 1949<Ref title="The synthesis of two-terminal switching circuits" people="Claude Shannon" url="https://doi.org/10.1002%2Fj.1538-7305.1949.tb03624.x" references={references} />, and later revised by Muller (1956).<Ref title="Complexity in Electronic Switching Circuits" people="Bodegas De Muller" url="https://doi.org/10.1109/TEC.1956.5219786" references={references} />
The idea is to use a simple counting argument to show that *almost all Boolean functions are complex*.
The original proofs are fairly lengthy and technical (Muller has put it in the article’s appendix!), but since then, many slightly modified proofs have been presented.<Ref title="Algorithms and Complexity: Handbook of Theoretical Computer Science. Chapter 14, Theorem 2.4" people="Ravi B. Boppana, Michael Sipser" url="doi.org/10.1016/B978-0-444-88071-0.50019-9" references={references} /><Ref title="Boolean Circuit Complexity: Scribe notes. Lecture 1, Theorem 1.6" people="Uri Zwick, Omer Shibolet" url="https://www.cs.tau.ac.il//~zwick/scribe-boolean.html" references={references} /><Ref title="Boolean Function Complexity: Advances and Frontiers. Chapter 1, Lemma 1.12" people="Stasys Jukna" url="doi.org/10.1007/978-3-642-24508-4" references={references} /> Below I present a modified version based on the sources mentioned.

<!-- TODO: Add definition of B_2 -->

Denote with $\alpha(n, s)$ the number of different circuits over $B_2$ with $n$ input variables, and $s$ internal gates.
Now, we want to give a relatively simple expression to bound $\alpha(n, s)$ from above.
Since it is hard to map and count combinatorially the number of acyclic graphs with $s+n$ vertices, we lift this constraint, and construct a set $\mathcal{A}$, which consists of all graphs with $s+n$ vertices, where $n$ vertices have no incoming edges and correspond to the $n$ input vertices in a circuit. The other $s$ vertices have an in-degree of 2, where each incoming edge can be one of the $s+n$ other vertices. In addition, each of the $s$ vertex is also labeled with one of the $\left|B_2\right| = 16$ gates. Finally, one vertex out of the $s$ vertices is labeled as the output vertex.

First, it is easy to see that there are exactly $16 (s+n)^2$ different gate vertices: There are 16 options for the gate label, and another $(s+n)$ options for each of the 2 incoming edges. Hence,

$$
\begin{aligned}
\alpha(n, s) \le \left|\mathcal{A}\right|
    \le \left( 16 \cdot (s+n)^2 \right)^s
    = \left( 4^2 \cdot (2s)^2 \right)^s
    = \left( 8s \right)^{2s}
\end{aligned}
$$

For convenience, let's take the logarithm of both sides:

$$
\begin{aligned}
    \log\left( \left|\mathcal{A}\right| \right) &\le \log\left( \left( 8s \right)^{2s} \right)
    = 2s \log( 8s )
\end{aligned}
$$

By plugging $s = 2^n / n$ we get:

$$
    \log\left( \left|\mathcal{A}\right| \right)
    \le 2 \frac{2^n}{n} \log\left( 8 \frac{2^n}{n} \right)
    = \frac{2^{n+1}}{n} \left( (n+3) - \log(n) \right)
$$

Assuming $n \ge 3$ gives us:

$$
\begin{aligned}
    &\le \frac{2^{n+1}}{n} \left( 2n - \log(n) \right)
    &= 2^{n+2} - \frac{2^{n+1}}{n} \log(n)
    % &\le 2^{n+2} - \frac{2^n}{n} \log(n) \\
    &\le 2^n - \frac{2^n}{n} \log(n) + \mathcal{O}(1)
\end{aligned}
$$

Putting it all together, we got that:

$$
\alpha(n, 2^n/n) \le \left|\mathcal{A}\right| \le 2^{2^n} \cdot 2^{- \frac{2^n}{n} \log(n)} \cdot \mathcal{O}(1)
$$

Recall that there are only $2^{2^n}$ unique boolean functions of $n$ variables. But the number of different circuits with $2^n/n$ gates is bounded above by a value that is $2^{\frac{2^n}{n} \log(n)}$ times smaller than that! Hence, clearly most boolean functions require more than $2^n/n$ gates to compute.

### Only Linear Explicit Lower Bounds

### Monotone Bounds

### Slice Bounds

## Why Lower Bounds Are Hard?

### The Complexity Of Not Gates

## Connection To Classical Computational Theory

On $\textsf{P}/\textsf{poly}$.

## Final Notes

### Other Models Of Computation

## References and Further Reading

<Ref
    title="Boolean Function Complexity: Advances and Frontiers"
    url="https://www.doi.org/10.1007/978-3-642-24508-4"
    people="Stasys Jukna"
    references={references}
/>

<ReferencesList {references}/>
