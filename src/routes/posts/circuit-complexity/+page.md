---
layout: post
title: "Introduction To Circuit Complexity"
description: "On the Power and Importance of Boolean Function Analysis, and why it is so Hard?"
published: 2025-06-18
tags: ["#SoME4", "Theoretical Computer Science"]
---

<script lang="ts">
    import EyeCatcher from "./lib/EyeCatcher.svelte";
    import Th2Circuit from "./lib/Th2Circuit.svelte";
    import GatesView from "./lib/GatesView.svelte";
    import FactorCircuit from "./lib/FactorCircuit.svelte";

    import Ref from "$lib/Ref.svelte";
    import ReferencesList from "$lib/ReferencesList.svelte";
    import { NewReferenceList } from "$lib/ReferencesList.svelte";

    let references = NewReferenceList();

    let highlightDependentOnBothVariables: () => any;
    let highlightDependentOnX1: () => any;
    let highlightDependentOnX2: () => any;
    let highlightConstants: () => any;

    let innerWidth: number;
    $: isMobile = Boolean(innerWidth < 480);
</script>

<svelte:window bind:innerWidth />

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

## The Boolean Circuit

Intuitively, a *boolean circuit* is a description of a computation of a large boolean function $f : \{0, 1\}^n \to \{0,1\}$, that meticulously concatenates the outputs of *weaker* boolean functions $g : \{0, 1\}^k \to \{0, 1\}$, which we call *gates*.
The number of input bits $k$ in a given gate is sometimes called the *fanin* or *in-degree* of the gate, and for the purpose of this post, all gates are of fanin of at most 2.
It is easy to show that there are $2^{2^k}$ different gates of *fanin* $k$, and in particular, there are exactly $2^{2^2} = 16$ unique gates with two inputs.
We denote by $B_n$ the set of all boolean functions with $n$ input variables.

<GatesView bind:highlightDependentOnBothVariables bind:highlightDependentOnX1 bind:highlightDependentOnX2 bind:highlightConstants />

Notice that out of the 16 gates of in $B_2$, only <a on:click={highlightDependentOnBothVariables}>10 gates</a> depend on both inputs, <a on:click={highlightDependentOnX1}>2 gates</a> depend strictly on $x_1$, <a on:click={highlightDependentOnX2}>another 2</a> depends only on $x_2$, and the final <a on:click={highlightConstants}>2 gates</a> depend on no inputs, and their outputs are constant.
Hence, this family of gates actually encapsulates all gates of *fanin* $\le 2$.

We call a collection $\Phi$ of boolean functions a *basis*.
Then, a *circuit* $C$ over $\Phi$ is a directed acyclic graph $G = (V, E)$ where all nodes $v \in V$ with $\deg_\text{in}(v) = 0$ are labeled by a variable $(x_1, x_2, \dots)$, and are called the *inputs* of the circuit.
Every other node $u \in V$ is labeled by a function (gate) from $\Phi$ of $\deg_\text{in}(u)$ variables.
In addition, nodes $w \in V$ where $\deg_\text{out}(w) = 0$ are called the *outputs* of the circuit and are labeled by $(y_1, y_2, \dots)$.<Ref title="Boolean Circuit Complexity: Scribe notes. Lecture 1, Section 1.1" people="Uri Zwick, Omer Shibolet" url="https://www.cs.tau.ac.il/~zwick/scribe-boolean.html" references={references} />

<Th2Circuit />

### Circuits Computing Functions

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

We denote by $C_\Phi(f)$ and $D_\Phi(f)$ the minimal size and depth, respectively, across all circuits that computes $f$ over $\Phi$. The main point of interest in circuit complexity is the behavior of those complexity measures on different functions and families of functions. Mainly, one can ask himself:

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

Boolean functions can represent very complex properties.
The model described above can also be extended to functions that output multiple bits.
Given a function $f : \{0, 1\}^n \to \{0, 1\}^m$, we can define $m$ different functions $f_1, f_2, \dots, f_m$ where each $f_i : \{0, 1\}^n \to \{0, 1\}$ is defined such that $f_i(x) = 1$ if and only if the $i$-th bit of $f(x)$ is 1.
I will use $y = (y_1, y_2, \dots, y_m)$ to denote the output vector of such functions, where $y_i$ is the $i$-th output bit.

### Factorization

A particularly interesting example of a function with multiple outputs bits is $\text{FACTOR}_n : \{0, 1\}^n \to \{0, 1\}^{\lceil n/2 \rceil}$, that takes a binary vector $(x_1, x_2, \dots, x_n)$, that encodes a binary integer $x^\star = \sum_{i=1}^n x_i 2^{i-1}$, and outputs a similarly encoded integer $y^\star = \sum_{i=1}^{\lceil n/2 \rceil} y_i 2^{i-1}$, where $y^\star$ is the smallest prime factor of $x^\star$ (or 0 if $x^\star$ is prime).
Notice that since the smallest factor of $k$ is $\le \sqrt{k}$, we only need at most $\log(\sqrt{k}) \le \lceil n/2 \rceil$ bits to encode it.<Ref title="Integer factorization" url="https://en.wikipedia.org/wiki/Integer_factorization" people="Wikipedia" references={references} />
This function is well-defined, and factoring large numbers is widely believed to be hard in general: many cryptographic schemes rely on this hardness to ensure their security.<Ref title="RSA cryptosystem" url="https://en.wikipedia.org/wiki/RSA_cryptosystem" people="Wikipedia" references={references} />

<FactorCircuit />

### Hash Functions

Another interesting cryptographic primitive is *cryptographic hash functions*. For our purposes, a hash function is a boolean function $\{0, 1\}^n \to \{0, 1\}^m$, where $n \gg m$. Such functions deterministically map large inputs to compact outputs that appear uncorrelated with the input.<Ref title="Cryptographic hash function" people="Wikipedia" url="https://en.wikipedia.org/wiki/Cryptographic_hash_function" references={references} /> Hash functions have many applications:

- *Password verification:* Instead of storing your password as plain text in a database, services store a hash of it instead. When you to log in, your input password gets hashed and compared to the stored hash in the database. This is necessary because even if the database is leaked, the attacker can't recover your actual password from the hash.<Ref title="Key derivation function: Password hashing" people="Wikipedia" url="https://en.wikipedia.org/wiki/Key_derivation_function#Password_hashing" references={references} />
- *Message Authentication:* When you send data digitally (say, transferring funds through your bank's website), it is important to ensure that the data was not tampered with on the way. One way to ensure this is to append $\text{hash}(m \cdot s)$ to your message $m$, where $s$ is a shared secret that only you and the other party know, and $\cdot$ denotes concatenation.<Ref title="Message authentication code" people="Wikipedia" url="https://en.wikipedia.org/wiki/Message_authentication_code" references={references} /><Ref title="HMAC" people="Wikipedia" url="https://en.wikipedia.org/wiki/HMAC" references={references} />

But what makes a hash function *secure*? One essential property is called *pre-image resistance*: Given an output $h$, finding a message $m$ such that $\text{hash}(m) = h$ should be computationally infeasible.
We can formalize this property using circuit complexity!
Given a hash candidate $\text{hash}: \{0, 1\}^n \to \{0, 1\}^m$, we can define the inverse of it $\text{hash}^{-1}: \{0, 1\}^m \to \{0, 1\}^n$, that for each hashed value $h$ returns any $m$ such that $\text{hash}(m) = h$ (or the $0^n$ if such input does not exist).
Then, proving a large lower bound on the complexity of $\text{hash}^{-1}$ would imply the pre-image resistance of $\text{hash}$!

It is important to note that the state-of-the-art cryptographic hash functions (mainly, the *SHA family*<Ref title="Secure Hash Algorithms" url="https://en.wikipedia.org/wiki/Secure_Hash_Algorithms" references={references} />) have no such rigorous proof: Their security is based on empirical evidence only (decades of cryptanalysis trying to break them, without success). Providing such proof on existing hashes will be a major achievement!

## Almost All Functions Are Complex

A primary result that ignited Circuit Complexity as a field of study came from Shannon in 1949<Ref title="The synthesis of two-terminal switching circuits" people="Claude Shannon" url="https://doi.org/10.1002%2Fj.1538-7305.1949.tb03624.x" references={references} />, and later revised by Muller (1956).<Ref title="Complexity in Electronic Switching Circuits" people="Bodegas De Muller" url="https://doi.org/10.1109/TEC.1956.5219786" references={references} />
The idea is to use a simple counting argument to show that almost all Boolean functions require a circuit of size $\ge 2^n / n$.
The original proofs are fairly lengthy and technical (Muller has put it in the article’s appendix!), but since then, many slightly modified proofs have been presented.<Ref title="Algorithms and Complexity: Handbook of Theoretical Computer Science. Chapter 14, Theorem 2.4" people="Ravi B. Boppana, Michael Sipser" url="https://doi.org/10.1016/B978-0-444-88071-0.50019-9" references={references} /><Ref title="Boolean Circuit Complexity: Scribe notes. Lecture 1, Theorem 1.6" people="Uri Zwick, Omer Shibolet" url="https://www.cs.tau.ac.il//~zwick/scribe-boolean.html" references={references} /><Ref title="Boolean Function Complexity: Advances and Frontiers. Chapter 1, Lemma 1.12" people="Stasys Jukna" url="https://doi.org/10.1007/978-3-642-24508-4" references={references} /> Below I present a modified version based on the sources mentioned.

Denote with $\mathcal{\phi}(n, s)$ the number of different circuits over $B_2$ with $n$ input variables, and $s$ internal gates.
Now, we want to give a relatively simple expression to bound $\mathcal{\phi}(n, s)$ from above.
We construct a set $\mathcal{A}$, which consists of all graphs with $s+n$ vertices, where $s \ge n \ge 3$, with the following restrictions:

- $n$ vertices have no incoming edges.
- The other $s$ vertices have an in-degree of 2. Each of those vertices is also labeled with one of the $\left|B_2\right| = 16$ gate functions.

Clearly, some of these graphs do not represent a legal circuit (mainly, nothing requires the a graph in $\mathcal{A}$ to be acyclic).
Despite that, every legal circuit with $n$ inputs and $s$ internal gates has a corresponding graph in $\mathcal{A}$!
Also, note that the output vertex is not explicitly labeled. In a legal circuit, it is the only gate with an out-degree of zero.

First, it is easy to see that there are exactly $16 (s+n)^2$ different ways to characterize a single gate vertex; There are 16 options for the gate label, and another $(s+n)$ options for each of the 2 incoming edges. We have exactly $s$ such vertices, and hence,

{#if isMobile}
$$
\begin{aligned}
\mathcal{\phi}(n, s) \le \left|\mathcal{A}\right|
    &\le \left( 16 \cdot (s+n)^2 \right)^s \\
    &= \left( 4^2 \cdot (2s)^2 \right)^s \\
    &= \left( 8s \right)^{2s}
\end{aligned}
$$
{:else}
$$
\begin{aligned}
\mathcal{\phi}(n, s) \le \left|\mathcal{A}\right|
    \le \left( 16 \cdot (s+n)^2 \right)^s
    = \left( 4^2 \cdot (2s)^2 \right)^s
    = \left( 8s \right)^{2s}
\end{aligned}
$$
{/if}

For convenience, let's take the logarithm of both sides:

$$
\begin{aligned}
    \log\left( \left|\mathcal{A}\right| \right) &\le \log\left( \left( 8s \right)^{2s} \right)
    = 2s \log( 8s )
\end{aligned}
$$

By plugging $s = 2^n / n$ we get:

{#if isMobile}
$$
\begin{aligned}
    \log\left( \left|\mathcal{A}\right| \right)
    &\le 2 \frac{2^n}{n} \log\left( 8 \frac{2^n}{n} \right) \\
    &= \frac{2^{n+1}}{n} \left( (n+3) - \log(n) \right)
\end{aligned}
$$
{:else}
$$
    \log\left( \left|\mathcal{A}\right| \right)
    \le 2 \frac{2^n}{n} \log\left( 8 \frac{2^n}{n} \right)
    = \frac{2^{n+1}}{n} \left( (n+3) - \log(n) \right)
$$
{/if}

Assuming $n \ge 3$ gives us:

$$
\begin{aligned}
    \log\left( \left|\mathcal{A}\right| \right)
    &\le \frac{2^{n+1}}{n} \left( 2n - \log(n) \right) \\
    &= 2^{n+2} - \frac{2^{n+1}}{n} \log(n) \\
    &\le 2^n - \frac{2^n}{n} \log(n) + \mathcal{O}(1)
\end{aligned}
$$

Putting it all together, we got that:

$$
\mathcal{\phi}(n, 2^n/n) \le \left|\mathcal{A}\right| \le 2^{2^n} \cdot 2^{- \frac{2^n}{n} \log(n)} \cdot \mathcal{O}(1)
$$

Recall that there are only $2^{2^n}$ unique boolean functions of $n$ variables. But the number of different circuits with $2^n/n$ gates is bounded above by a value that is $2^{\frac{2^n}{n} \log(n)}$ times smaller than that! Hence, clearly most boolean functions require more than $2^n/n$ gates to compute.

## An Explicit Linear Lower Bound

We now show that for certain functions with $n$ inputs, any gate computing them must consist of at least $\mathcal{O}(n)$ gates.

We say that a function $f$ *depends* on a variable $x_i$ if there exists an assignment that fixes all other variables so that changing only $x_i$ from 0 to 1 changes the output of $f$.
It is easy to see that in any circuit that computes $f$, there must be a path from every variable $x_i$ that $f$ depends on to the output vertex.
Hence, each input vertex $x_i$ must have an out-degree of at least 1.
Since in our model the in-degree of each gate is $\le 2$, just connecting all input vertices to arbitrary gates will require at least $\lceil n/2 \rceil$ gates, and hence the $\mathcal{O}(n)$ lower bound.

## No Super-Linear Explicit Lower Bounds

The bound above is not tight, and trying to improve it is a nice exercise!
Surprisingly however, there is no explicit lower bound which *asymptotically* better! The current state-of-the-art is a bound of $5n - o(n)$ gates by Iwama and Morizumi (2002).<Ref title="An Explicit Lower Bound of 5n−o(n) for Boolean Circuits" people="Kazuo Iwama, Hiroki Morizumi" url="https://doi.org/10.1007/3-540-45687-2_29" references={references} /><Ref title="Boolean Function Complexity: Advances and Frontiers. Section 1.5.2: Explicit Lower Bounds" people="Stasys Jukna" url="https://doi.org/10.1007/978-3-642-24508-4" references={references} />

I cannot stress enough how absurd and mind-boggling that is: despite the fact that we know that almost all boolean functions are very complex, requiring at least $2^n / n$ gates as shown above, we do not know how to point at a specific function and state that it requires more than a linear number of gates to compute it! This gap is at the heart of the field, and over the last half a century many researches have tried to tackle this problem without much success.

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

<ReferencesList {references} />
