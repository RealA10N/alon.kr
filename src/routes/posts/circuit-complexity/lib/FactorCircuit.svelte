<script lang="ts">
	import Circuit from '$lib/graphs/Circuit.svelte';
	import Figure from '$lib/Figure.svelte';
	import { type Edge } from '$lib/graphs/Graph.svelte';

	import {
		type Gate,
		NewAndGate,
		NewInputGate,
		NewNotGate,
		NewOrGate,
		NewOutputGate
	} from '$lib/graphs/Circuit.svelte';
	import { writable, type Writable } from 'svelte/store';

	let inputs = writable([false, false, false, false]);

	let vertices: Gate[] = [
		{ id: 1, ...NewInputGate(inputs, 0), x: -92, y: -127 },
		{ id: 2, ...NewInputGate(inputs, 1), x: -57, y: -65 },
		{ id: 3, ...NewInputGate(inputs, 2), x: -38, y: 151 },
		{ id: 4, ...NewInputGate(inputs, 3), x: -38, y: 151 },
		{ id: 5, ...NewAndGate(), x: 40, y: -136 },
		{ id: 6, ...NewOrGate(), x: -165, y: -16 },
		{ id: 7, ...NewAndGate(), x: 16, y: -14 },
		{ id: 8, ...NewOrGate(), x: -69, y: 75 },
		{ id: 9, ...NewNotGate(), x: 64, y: 87 },
		{ id: 10, ...NewAndGate(), x: 125, y: -32 },
		{ id: 11, ...NewAndGate(), x: 125, y: -32 },
		{ id: 12, ...NewOrGate(), x: 125, y: -32 },
		{ id: 13, ...NewAndGate(), x: 125, y: -32 },
		{ id: 14, ...NewOutputGate(0), x: 125, y: -32 },
		{ id: 15, ...NewOutputGate(1), x: 125, y: -32 }
	] as Gate[];

	let edges: Edge[] = [
		{ source: 2, target: 5 },
		{ source: 3, target: 5 },
		{ source: 2, target: 6 },
		{ source: 3, target: 6 },
		{ source: 1, target: 7 },
		{ source: 6, target: 7 },
		{ source: 3, target: 8 },
		{ source: 4, target: 8 },
		{ source: 7, target: 9 },
		{ source: 8, target: 10 },
		{ source: 9, target: 10 },
		{ source: 4, target: 11 },
		{ source: 5, target: 11 },
		{ source: 10, target: 12 },
		{ source: 11, target: 12 },
		{ source: 1, target: 13 },
		{ source: 12, target: 13 },
		{ source: 13, target: 14 },
		{ source: 12, target: 15 }
	].map((e) => ({ ...e, direction: true } as Edge));
</script>

<Figure>
	<Circuit slot="content" bind:vertices bind:edges bind:inputs />

	<svelte:fragment slot="caption">
		A circuit with 9 internal gates over the basis &#123;∧, ∨, ¬&#125; computing the smallest factor
		of integers up to 15.
	</svelte:fragment>
</Figure>
