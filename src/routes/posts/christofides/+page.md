---
title: The Christofides Algorithm
description: "Approximating the Metric TSP Problem: An Introduction to Combinatorial Optimization."
published: 2023-05-20
tags: ["#SoME3", "Algorithms", "Programming"]
length: 13
---

<script>
   import Graph from "$lib/Graph.svelte";
   import GraphWithMst from "./mst/GraphWithMst.svelte";
   import GraphWithTsp from "./tsp/GraphWithTsp.svelte";
   import GraphCycleMatching from "./GraphCycleMatching.svelte";
   let references = [];
   import Ref from "$lib/Ref.svelte";
   import ReferencesList from "$lib/ReferencesList.svelte";
</script>

The traveling salesman problem (or TSP for short) is a well-studied problem in computer science and graph theory: Given a graph $G=(V, E)$ and a cost function on the edges $c: E \to \R^+$, what is the cheapest cycle that visits all vertices of the graph?

<GraphWithTsp allSteps={false} />

Finding such cycle is very useful on its own, but it also has many applications and usages in other problems. An obvious use case would be planning the route for package delivery service at the beginning of the day, such that all packages are delivered and the minimum amount of fuel is used. Another more interesting application would be the design of a network or circuit board, aiming to optimize the efficiency and data transition times, while minimizing the size and costs. TSP also appears as a sub-problem in many other fields that may not seem related at all at first, such as DNA sequencing and astronomy. <Ref title="Travelling salesman problem" people="Wikipedia" url="https://en.wikipedia.org/wiki/Travelling_salesman_problem" references={references} />

## TSP is HARD.

Theoretical computer scientists love to study problems and the relations between them, in terms of their complexity. This field of computer science is called *computational complexity theory*. It turns out that the TSP problem is hard (*NP-Hard*). Not only that, the problem of determining if a given cycle (which visits all vertices of the graph) is the cheapest cycle, is hard too (*NP-Complete*). And if that wasn't enough, it has been proven that TSP can't be approximated ($1+\epsilon$ approximation in polynomial time), even with "easier" versions of TSP when we allow some constraints on the structure of the graph and the cost function. This fact is known as the *inapproximability* of the TSP problem. <Ref title="New Inapproximability Bounds for TSP" people="Marek Karpinski, Michael Lampis, Richard Schmied" url="https://arxiv.org/abs/1303.6437" references={references} />

## So, is all hope lost?

Well, not exactly. In this article, I will present the *Christofides Algorithm*<Ref title=" Worst-case analysis of a new heuristic for the traveling salesman problem" people="Nicos Christofides" url="https://apps.dtic.mil/dtic/tr/fulltext/u2/a025602.pdf" references={references} />, which is a classic approximation algorithm in the field of *combinatorial optimization*. The algorithm does not solve the general TSP problem (because it's hard!), but rather the **Metric TSP Problem**, which is an easier variant of the problem that provides some constraints on the input graph and cost function. Since we are talking in the context of graph theory, I present those constraints in their graphic definition:

1. The graph $G$ is a clique, meanings that there is an edge between every two vertices in $V$. A formal way to say that would be that $G=(V, V \times V)$, where $\times$ denotes the *cartesian product* of two groups.

2. The costs function $c$ satisfies the triangle inequality: $c(\alpha, \beta) + c(\beta, \gamma) \ge c(\alpha, \gamma)$ when $\alpha, \beta, \gamma$ are vertices $\in V$.

Although it is not as general as the non-metric TSP problem, Metric TSP is still a very interesting problem with many applications. In fact, most of the applications I've listed in the introduction are actually cases where solving the Metric TSP is sufficient. For example, it is not difficult to prove that the following two distance functions between two points on a plane $p_1 = (x_1, y_1)$ and $p_2 = (x_2, y_2)$ satisfy the inequality:

- The *Manhattan*<Ref references={references} title="Taxicab geometry" people="Wikipedia" url="https://en.wikipedia.org/wiki/Taxicab_geometry" /> distance: $|x_2-x_1| + |y_2-y_1|$

- The *Euclidian*<Ref references={references} title="Euclidean distance" people="Wikipedia" url="https://en.wikipedia.org/wiki/Euclidean_distance" /> distance: $\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$

Throughout this article, I will use the phrases *cost*, *weight* or *distance* interchangeably. All of them refer to the same function $c$. The cost of a collection of edges (cost of a path or a cycle) is defined as the sum of costs over all edges in the collection.

## Approximation Algorithms

In the field of theoretical computer science, and especially in combinatorial optimization, we usually try to solve hard (*NP-Hard*) problems using **approximation algorithms**. I won't dive too deeply into computational complexity here, but in general, when (and if) we know that a certain optimization problem is hard to solve exactly in polynomial time, we can instead solve it approximately. Such a solution may not be the best solution, but we would still want to prove some bound on "how good the solution is with respect to the optimal solution". There are multiple ways that one can do so, but in this article, we will use an *approximation factor*. <Ref references={references} title="Approximation Algorithms" people="Wikipedia" url="https://en.wikipedia.org/wiki/Approximation_algorithm" />

We say that an algorithm is an **$\alpha$-approximation algorithm** (*factor $\alpha$ approximation*) for a problem if and only if for every instance of the problem, our algorithm will find a solution within a factor of $\alpha$ of the optimum solution.

Since TSP is a minimization problem (we want to find a TSP cycle with *minimal* cost), then $\alpha\ge1$, and such algorithm will always find a cycle whose total cost is at most $\alpha$ times the cost of the optimal TSP cycle. <Ref references={references} title="Discrete Mathematics and Algorithms (Lecture notes)" people="Reza Zadeh" url="https://stanford.edu/~rezab/discrete/Notes/10.pdf" />

## Cycle Shortcutting

One very useful property that we will use in the algorithm analysis is that under the metric setting, any two consecutive edges in a path $v_1 \to v_2 \to v_3$ can be shortened into a shorter path $v_1 \to v_3$ by skipping over the middle vertex. This is possible since the graph is complete, so an edge $v_1 \to v_3$ always exists, and because of the triangle inequality, we know that $c(v_1, v_2) + c(v_2, v_3) \ge c(v_1, v_3)$.

From now on, given a graph $G$ we will denote an optimal TSP Cycle of it with $C^*$. Such a path is an ordered set of edges of the graph, where each edge is directed, and every two adjacent edges in the cycle are of the form $i \to k, k \to j$, for some $i, j, k \in V$ (notably, adjacent edges share a vertex). Additionally, of course, the first and last vertices are the same.

The cycle $C^*$ must visit every vertex at least once (by definition), so it must contain at least $n = |V|$ edges. On the other hand, if $C^*$ contains more than $n$ edges, then there exists a vertex that appears twice in $C^*$, and one of those appearances can be skipped, resulting in a shorter (or equally weighted) cycle. Hence, there must exist an optimal TSP cycle $C^*$ with exactly $n$ edges.

## Bounding TSP with MST

It turns out that the cost of the minimum spanning tree $T$ of a graph $G$ is actually a lower bound on $C^*$, meaning that $c(C^*) \ge c(T)$. This is because removing any edge $e$ from $C^*$ results in a tree whose edges are $C^* \setminus \{e\}$. This tree spans all vertices of the original graph and thus is a spanning tree. By definition, the weight of $T$ is minimal across all spanning trees of $G$, and thus $c(C^* \setminus \{e\}) \ge c(T)$. From that we easily show that the cost of $C^*$ is at least $c(T)$:

$$
c(C^*) \ge c(C^*) - c(e) = c(C^* \setminus \{e\}) \ge c(T)
$$

Unlike TSP, finding the MST of a graph is considered easy, and there are multiple efficient, popular algorithms that do that ([Prim's](https://en.wikipedia.org/wiki/Prim%27s_algorithm), [Kruskal's](https://en.wikipedia.org/wiki/Kruskal%27s_algorithm), [Borůvka's](https://en.wikipedia.org/wiki/Bor%C5%AFvka%27s_algorithm)). This is very promising! We now have a building block (MST) that we can easily compute, which resembles a TSP cycle very well and is guaranteed to have a lower cost than the optimal TSP.

<GraphWithMst/>

## An Approximation Using MSTs

Using this fact, we can now show a fairly straightforward $2$-approximation for the Metric TSP problem:

1. Find the MST of $G=(V,E)$, and denote it as $T=(V, F)$.
2. Construct a new graph $T' = (V, F')$ where $F'$ is the multiset that contains every edge of $F$ exactly twice. In other words, $T'$ is the tree $T$ where all of its edges are duplicated.
3. Find an Eulerian cycle of $T'$ and denote it as $C$.
4. Shortcut the cycle $C$ to a cycle $C'$ containing exactly $n$ unique vertices.

### Correctness

It is known that an Eulerian cycle can be found in a connected graph if and only if the degree of all vertices is even. Since $T'$ is the tree $T$ where each edge is duplicated, the degree of all vertices of $T'$ must be even. Besides that, every Eulerian cycle of a connected graph with vertices of even degree is a valid TSP Cycle since it must visit all vertices. We apply shortcutting only if it leaves the cycle a valid TSP Cycle, and thus the algorithm yields a valid TSP Cycle as required.

### Approximation Factor

$$
c(C') \le c(C) \le 2\cdot c(T) \le 2 \cdot c(C^*)
$$

Hence this simple approximation algorithm actually returns a cycle that costs at most twice as the optimal TSP cycle.

### Runtime Analysis

Since both finding an MST and an Eulerian cycle of a graph are easy, polynomial problems, and $T$, $T'$, $C$, and $C'$ are all of polynomial size relative to the size of the input graph $G$, the resulting algorithm is polynomial as well; I will leave it to the reader to provide a strict bound.

## The Problem of the Naïve Approximation

We have the MST as a lower bound on the optimal TSP Cycle. The problem is that the MST is not a cycle; by duplicating the edges of the tree and finding the Eulerian cycle in the new graph $T'$, we convert the tree, in a fairly clever manner, into a cycle as desired.

Sadly, this conversion costs a lot in the approximation factor. As mentioned before, all that is required from $T'$ is that all vertices of it are of even degree. By duplicating all edges of $T$ we obviously guarantee that, but do we have to duplicate *all* edges of the MST? Why not leave even vertices untouched, and modify only the bad vertices? Additionally, vertices with degree 5 (for example) would be of degree 10 after duplication, but degree 6 would suffice, as that is also even.

## The Handshaking Lemma

The *Handshaking lemma* states that in any undirected graph, the number of vertices of odd degree is even. The following is a sketch of the proof; Consider a general undirected graph $G=(V,E)$. Since every edge in a graph contributes exactly twice to the degree of some two vertices in the graph, we get that
$$
\sum_{v \in V} \deg(v) = 2 \left| E \right|
$$
meaning that the sum of degrees across all vertices in the graph is even. If we partition $V$ into two sets $V =V_\text{even} \sqcup  V_\text{odd}$ , then we get
$$
\sum_{v \in V_\text{odd}}{ \deg(v) } + \underbrace{\sum_{v\in V_\text{even}}{\deg(v)}}_\text{even} = \underbrace{2 \left| E \right|}_\text{even}
$$
Hence $\sum_{v \in V_\text{odd}} \deg(v)$ must be even too. By definition, all elements in the sum are even, meaning that $|V_\text{odd}|$ must be even, as required. <Ref references={references} title="Handshaking Lemma" people="Wikipedia" url="https://en.wikipedia.org/wiki/Handshaking_lemma"/>

Recall that in the naïve algorithm, we have the MST and we want to convert it to a graph with even vertices only. By the Handshaking lemma, we know that the number of *bad* vertices (odd degree vertices) must be even, which is a crucial observation towards Christofides' Algortihm.

## Finally... Christofides' Algorithm

Christofides' algorithm is an elegant and revolutionary algorithm that provides a $1.5$-approximation for the Metric TSP problem. In other words, it outputs a cycle of the graph where the cost of the cycle (which is defined by the sum of all costs of edges in the cycle), is at most 50% more than the cost of the shortest cycle possible.

<GraphWithTsp allSteps={true} />

The algorithm steps follow:

1. Find the MST of $G=(V,E)$, and denote it as $T=(V, F)$.
2. Denote with $U \subseteq V$ the set of vertices with *odd* degree in relation to $T$.
3. Find a *Minimum Weight Perfect Matching* (MPM) of vertices $U$, and denote such matching with $J$.
4. Construct a new graph $T' = (V, F \cup J)$, merging the MST with the MPM, where $F \cup J$ is a multiset that may contain the same edge more than once.
5. Find an Eulerian cycle of $T'$ and denote it as $C$.
6. Shortcut the cycle $C$ to a cycle $C'$ containing exactly $n$ unique vertices.

### Correctness

The key to the correctness of the algorithm is the *handshaking lemma*, which states that in all undirected graphs, the number of vertices of an odd degree is even. This means that a perfect matching $J$ of the odd degree vertices $U$ always exists since the graph is a clique.

The matching $J$ adds exactly one edge endpoint to all vertices of odd degree in the MST $T$, making the union of the MST and MPM $T'$ an undirected graph with even degree vertices only. This, as discussed before, is sufficient for finding an Eulerian cycle $C$ in $T'$, which is a valid TSP cycle. The way we apply shortcutting keeps the cycle a TSP cycle and thus the algorithm yields a valid TSP Cycle as required.

### Approximation Factor

Consider an optimal TSP cycle $C^*$. By shortcutting, we can transform such cycle to a new cycle of *even* length $C^*_U$, that visits only vertices of odd degree of $T$ (meaning that they are $\in U$) and skip over vertices of even degree. We only use shortcuts to get to $C^*_U$ from $C^*$, and hence $c(C^*_U) \le c(C^*)$.

<GraphCycleMatching />

We can now partition the cycle $C^*_U$ into two different matchings $M_1, M_2$ of vertices $\in U$. Without loss of generality, denote $U=\{v_1, v_2, ..., v_k\}$ where $k$ is even. Then,
$$
M_1 = \{ (v_1, v_2), (v_3, v_4), ..., (v_{k-1}, v_k) \}
\\ M_2 = \{ (v_2, v_3), (v_4, v_5), ..., (v_k, v_1) \}
$$
By this construction, we get that the edges of the cycle $C^*_U$ are exactly $M_1 \sqcup M_2$. Since both $M_1$ and $M_2$ are perfect matchings of all vertices $\in U$, they both serve as upper bounds on the minimum weight perfect matching $J$ of those vertices. We get that:
$$
c(C^*) \ge c(C^*_U) = c(M_1) + c(M_2) \ge 2 \cdot c(J)
$$
Hence we get that $c(J) \le {c(C^*) \over 2}$. Since the algorithm yields an Eulerian cycle $C$ of edges $F$ of the MST $T$ joined with $J$, we get
$$
c(C) = c(F) + c(J) \le 1.5 \cdot c(C^*)
$$
Hence the algorithm yields a cycle $C$ which costs at most $1.5$ times the cost of the optimal TSP cycle $C^*$, meaning that the algorithm has an approximation factor of $1.5$ as required.

### Runtime Analysis

The analysis is similar to the naïve algorithm analysis, with the addition of finding the minimum weight perfect matching. Using [Edmond's Blossom algorithm](https://en.wikipedia.org/wiki/Blossom_algorithm), it is possible to find the minimum weight perfect matching in a polynomial $\mathcal{O}(n^3)$ time. I won't dive into Edmond's algorithm in this article; It turns out that finding the matching is actually the bottleneck of Christofides' algorithm, and it too runs in $\mathcal{O}(n^3)$.


## Christofides in Practice

When I first saw Christofides' algorithm, I thought to myself that the 1.5 approximation factor is pretty 💩! I mean, if I was the head of some delivery company, I would surely not be happy to know that the route planning algorithm can be improved by 33%. The practical implications of how close we can approximation TSP is huge in the real world.

Well, remember that 1.5 is an *upper bound* on the approximation ratio. In practice, especially on large dense graphs, the algorithm yields a cycle that is not that far from the optimal cycle on average. Try it yourself! play with the simulation above, and try to get it to output a cycle that is clearly not close to the optimal. Note that since computing the actual optimal TSP cycle is exponentially hard, comparing the approximation to the optimal TSP cycle is emitted from the simulation. <Ref references={references} title="A Probabilistic Analysis of Christofides' Algorithm" url="http://www.cse.iitm.ac.in/~bvrr/conf/swat12.pdf" people="Markus Blaser, Konstatinos Panagiotou, B. V. Raghavendra Rao" />

## Does a better approximation exist?

Christofides published his paper in 1976, and for almost 50 years (!) it was the best-known approximation algorithm for the Metric TSP problem. In 2020 however, a paper that consists of 90 pages was published with the following abstract: *"For some $\epsilon > 10^{-36}$ we give a randomized $3/2 - \epsilon$ approximation algorithm for metric TSP."* <Ref references={references} title="A (Slightly) Improved Approximation Algorithm for Metric TSP" url="https://arxiv.org/pdf/2007.01409.pdf" people="Anna R. Karlin, Nathan Klein, Shayan Oveis Gharan"/>

Although the algorithm is much more complex (I did not even try to understand it), and the approximation improvement is clearly not sufficient, it actually proves that $3/2$ is not the lower bound of the approximation factor. This gives hope that an efficient and elegant algorithm exists whose factor is a magnitude better than $1.5$, and we just haven't discovered it yet. The paper was published at [STOC'21](https://en.wikipedia.org/wiki/Symposium_on_Theory_of_Computing) and for this reason, received the best paper award.

## References and further reading

I was heavily inspired to write this post after a lecture about the topic of [Prof. Feldman Moran](https://cs.haifa.ac.il/~moranfe/) in the course Combinatorial Optimization at the University of Haifa, spring 2023. Proofreading was done by [Almog Ben Chen](https://www.youtube.com/@almogbenchen6282). Thanks!

<ReferencesList {references}/>
