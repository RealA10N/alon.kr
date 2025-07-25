<script lang="ts">
	import Figure from '$lib/Figure.svelte';
	import { Color } from '$lib/interfaces/color';
	import Circuit, {
		type Gate,
		NewAndGate,
		NewInputGate,
		NewNotGate,
		NewOrGate,
		NewOutputGate
	} from '$lib/graphs/Circuit.svelte';
	import { type Edge } from '$lib/graphs/Graph.svelte';
	import { writable, type Writable } from 'svelte/store';

	let inputs: Writable<boolean[]> = writable([false, false, false]);

	let vertices: Gate[] = [
		{ id: 0, x: -92, y: -127, ...NewInputGate(inputs, 0) },
		{ id: 1, x: -57, y: -65, ...NewInputGate(inputs, 1) },
		{ id: 2, x: -38, y: 151, ...NewInputGate(inputs, 2) },
		{ id: 3, x: 40, y: -136, ...NewAndGate() },
		{ id: 4, x: -165, y: -16, ...NewOrGate() },
		{ id: 5, x: 16, y: -14, ...NewNotGate() },
		{ id: 6, x: -69, y: 75, ...NewAndGate() },
		{ id: 7, x: 64, y: 87, ...NewAndGate() },
		{ id: 8, x: 125, y: -32, ...NewOrGate() },
		{ id: 9, x: 176, y: 79, ...NewOutputGate(0) }
	].map((v) => ({ ...v, color: Color.Red } as Gate));

	let edges: Edge[] = [
		{ source: vertices[0], target: vertices[3] },
		{ source: vertices[0], target: vertices[4] },
		{ source: vertices[1], target: vertices[3] },
		{ source: vertices[1], target: vertices[4] },
		{ source: vertices[2], target: vertices[7] },
		{ source: vertices[3], target: vertices[5] },
		{ source: vertices[3], target: vertices[8] },
		{ source: vertices[4], target: vertices[6] },
		{ source: vertices[5], target: vertices[6] },
		{ source: vertices[6], target: vertices[7] },
		{ source: vertices[7], target: vertices[8] },
		{ source: vertices[8], target: vertices[9] }
	].map((e) => ({ ...e, direction: true } as Edge));
</script>

<Figure>
	<Circuit slot="content" bind:vertices bind:edges bind:inputs />

	<svelte:fragment slot="caption">
		A circuit with 6 internal gates over the basis &#123;∧, ∨, ¬&#125; computing the Th<sub>2</sub> function:
		The output bit is on if at least two of the input bits are on.
	</svelte:fragment>
</Figure>
