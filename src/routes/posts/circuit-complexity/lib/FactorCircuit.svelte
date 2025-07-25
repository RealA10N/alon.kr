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
		{ id: 0, ...NewInputGate(inputs, 0), x: -92, y: -127 },
		{ id: 1, ...NewInputGate(inputs, 1), x: -57, y: -65 },
		{ id: 2, ...NewInputGate(inputs, 2), x: -38, y: 151 },
		{ id: 3, ...NewInputGate(inputs, 3), x: -38, y: 151 },
		{ id: 4, ...NewAndGate(), x: 40, y: -136 },
		{ id: 5, ...NewOrGate(), x: -165, y: -16 },
		{ id: 6, ...NewAndGate(), x: 16, y: -14 },
		{ id: 7, ...NewOrGate(), x: -69, y: 75 },
		{ id: 8, ...NewNotGate(), x: 64, y: 87 },
		{ id: 9, ...NewAndGate(), x: 125, y: -32 },
		{ id: 10, ...NewAndGate(), x: 125, y: -32 },
		{ id: 11, ...NewOrGate(), x: 125, y: -32 },
		{ id: 12, ...NewAndGate(), x: 125, y: -32 },
		{ id: 13, ...NewOutputGate(0), x: 125, y: -32 },
		{ id: 14, ...NewOutputGate(1), x: 125, y: -32 }
	] as Gate[];

	let edges: Edge[] = [
		{ source: vertices[1], target: vertices[4] },
		{ source: vertices[2], target: vertices[4] },
		{ source: vertices[1], target: vertices[5] },
		{ source: vertices[2], target: vertices[5] },
		{ source: vertices[0], target: vertices[6] },
		{ source: vertices[5], target: vertices[6] },
		{ source: vertices[2], target: vertices[7] },
		{ source: vertices[3], target: vertices[7] },
		{ source: vertices[6], target: vertices[8] },
		{ source: vertices[7], target: vertices[9] },
		{ source: vertices[8], target: vertices[9] },
		{ source: vertices[3], target: vertices[10] },
		{ source: vertices[4], target: vertices[10] },
		{ source: vertices[9], target: vertices[11] },
		{ source: vertices[10], target: vertices[11] },
		{ source: vertices[0], target: vertices[12] },
		{ source: vertices[11], target: vertices[12] },
		{ source: vertices[12], target: vertices[13] },
		{ source: vertices[11], target: vertices[14] }
	].map((e) => ({ ...e, direction: true } as Edge));
</script>

<Figure>
	<Circuit slot="content" bind:vertices bind:edges bind:inputs />

	<svelte:fragment slot="caption">
		A circuit with 9 internal gates over the basis &#123;∧, ∨, ¬&#125; computing the smallest factor
		of integers up to 15.
	</svelte:fragment>
</Figure>
