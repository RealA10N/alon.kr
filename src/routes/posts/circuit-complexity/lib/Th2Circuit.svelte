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

	let inputs: boolean[] = [false, false, false];
	const getInputs = () => inputs;

	let vertices: Gate[] = [
		{ id: 1, x: -92, y: -127, ...NewInputGate(getInputs, 0) },
		{ id: 2, x: -57, y: -65, ...NewInputGate(getInputs, 1) },
		{ id: 3, x: -38, y: 151, ...NewInputGate(getInputs, 2) },
		{ id: 4, x: 40, y: -136, ...NewAndGate() },
		{ id: 5, x: -165, y: -16, ...NewOrGate() },
		{ id: 6, x: 16, y: -14, ...NewNotGate() },
		{ id: 7, x: -69, y: 75, ...NewAndGate() },
		{ id: 8, x: 64, y: 87, ...NewAndGate() },
		{ id: 9, x: 125, y: -32, ...NewOrGate() },
		{ id: 10, x: 176, y: 79, ...NewOutputGate(0) }
	].map((v) => ({ ...v, color: Color.Red } as Gate));

	let edges: Edge[] = [
		{ source: 1, target: 4 },
		{ source: 1, target: 5 },
		{ source: 2, target: 4 },
		{ source: 2, target: 5 },
		{ source: 3, target: 8 },
		{ source: 4, target: 6 },
		{ source: 4, target: 9 },
		{ source: 5, target: 7 },
		{ source: 6, target: 7 },
		{ source: 7, target: 8 },
		{ source: 8, target: 9 },
		{ source: 9, target: 10 }
	].map((e) => ({ ...e, direction: true } as Edge));
</script>

<Figure>
	<Circuit slot="content" bind:vertices bind:edges bind:inputs />

	<svelte:fragment slot="caption">
		A circuit with 6 internal gates over the basis &#123;∧, ∨, ¬&#125; computing the Th<sub>2</sub> function:
		The output bit is on if at least two of the input bits are on.
	</svelte:fragment>
</Figure>
