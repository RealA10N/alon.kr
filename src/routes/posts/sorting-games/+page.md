---
title: Sorting Lower Bounds & Algorithmic Game Theory
description: "Using technics from the game and graph theory fields, we prove that O(nlogn) is the best complexity a deterministic comparison sorting algorithm can achieve."
published: 2023-12-20
tags: ["Game Theory", "Graph Theory", "Algorithms"]
length: 999
---

<script lang="ts">
    import PermutationShuffle from '$lib/arrays/PermutationShuffle.svelte';
    import InsertionSort from '$lib/arrays/InsertionSort.svelte';

    let references = [];
    import Ref from "$lib/Ref.svelte";
    import ReferencesList from "$lib/ReferencesList.svelte";
</script>

Whether you are a budding programmer, a curious technology enthusiast, or a seasoned computer scientist, you have probably needed to sort an array of numbers more than once. In fact, sorting algorithms have long been the backbone of countless applications and systems.

## Comparison Based Sorting

When you first learned about sorting algorithms, you might initially have been presented with [bubble sort](https://en.wikipedia.org/wiki/Bubble_sort), [insertion sort](https://en.wikipedia.org/wiki/Insertion_sort), or [selection sort](https://en.wikipedia.org/wiki/Selection_sort). Those sorting algorithms are *comparison based*, and in the worst case they all preform $\mathcal{O}(n^2)$ comparisons before sorting the elements.<Ref title="Sorting Algorithms" people="Wikipedia" url="https://en.wikipedia.org/wiki/Sorting_algorithm" references={references} />

<InsertionSort array={[4, 5, 2, 7, 1, 6, 3]} />

Sorting algorithms that are comparison based like the ones mentioned above do not care *what* they are actually sorting. As long as there is some function which can, given two elements, compare them and return the greatest one (and that this function is "consistent", which we formalize later), a comparison based algorithm will be able to spit out the order of the input elements just by repeatedly calling the provided function, compering different input elements. With insertion sort for example, we begin with some initial ordering of the elements, and always compare adjacent elements while shifting a new element to it's place in the ordering, we have repeated the process for all elements, and the elements are fully ordered. We limit the scope of sorting algorithms to comparison based ones only.

## Fastest Sorting Algorithm?

The comparison algorithms mentioned above all preform $\mathcal{O}(n^2)$ comparisons in
the worst case. However, there are popular comparison based algorithms that guarantee to preform at most $\mathcal{O}(n \log n)$ comparisons. Perhaps the simplest one is the [merge sort](https://en.wikipedia.org/wiki/Merge_sort). I will also mention the popular [Quicksort](https://en.wikipedia.org/wiki/Quicksort) algorithm which performs $\mathcal{O}(n^2)$ comparisons in the worst case, but is not deterministic and usually outperforms other algorithms when measuring time. In fact, modern implementations of the standard C/C++ library use [Introsort](https://en.wikipedia.org/wiki/Introsort), which is a hybrid combination of *quick sort* and *insertion sort*, resulting both worst case of $\mathcal{O}(n \log n)$ comparisons and fast running time in practice.<Ref title="Sorting Algorithms in C++" people="Wikipedia" url="https://en.wikipedia.org/wiki/Sort_(C%2B%2B)#Complexity_and_implementations" references={references} /> Python, Java and Rust use [Timsort](https://en.wikipedia.org/wiki/Timsort) as the standard sorting algorithm, which is hybrid too, and guarantees $\mathcal{O}(n \log n)$.

## References and Further Reading

<!-- https://www.cs.cmu.edu/~avrim/451f11/lectures/lect0913.pdf -->
<ReferencesList {references} />
