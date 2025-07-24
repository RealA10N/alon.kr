<script lang="ts">
	import { type Edge } from '$lib/graphs/Graph.svelte';
	import { type Gate, NewInputGate, NewNandGate, NewOutputGate } from '$lib/graphs/Circuit.svelte';
	import MultipleCircuits, { type GraphDesc } from '$lib/graphs/MultipleCircuits.svelte';
	import { writable } from 'svelte/store';

	const createAndGraph = () => {
		const inputs = writable([false, false]);

		const vertices = [
			{ id: 1, ...NewInputGate(inputs, 0), x: -150, y: -75 },
			{ id: 2, ...NewInputGate(inputs, 1), x: -150, y: 75 },
			{ id: 3, ...NewNandGate(), x: -50, y: 0 },
			{ id: 4, ...NewNandGate(), x: 50, y: 0 },
			{ id: 5, ...NewOutputGate(0), x: 150, y: 0 }
		] as Gate[];

		const edges = [
			{ source: 1, target: 3 },
			{ source: 2, target: 3 },
			{ source: 3, target: 4, curve: 30 },
			{ source: 3, target: 4, curve: -30 },
			{ source: 4, target: 5 }
		].map((e) => ({ ...e, direction: true } as Edge));

		return {
			name: 'And Reduction',
			inputs,
			vertices,
			edges
		} as GraphDesc;
	};

	const createOrGraph = () => {
		const inputs = writable([false, false]);

		const vertices = [
			{ id: 1, ...NewInputGate(inputs, 0), x: -150, y: -100 },
			{ id: 2, ...NewInputGate(inputs, 1), x: -150, y: 100 },
			{ id: 3, ...NewNandGate(), x: -50, y: -100 },
			{ id: 4, ...NewNandGate(), x: -50, y: 100 },
			{ id: 5, ...NewNandGate(), x: 50, y: 0 },
			{ id: 6, ...NewOutputGate(0), x: 150, y: 0 }
		] as Gate[];

		const edges = [
			{ source: 1, target: 3, curve: 30 },
			{ source: 1, target: 3, curve: -30 },
			{ source: 2, target: 4, curve: 30 },
			{ source: 2, target: 4, curve: -30 },
			{ source: 3, target: 5 },
			{ source: 4, target: 5 },
			{ source: 5, target: 6 }
		].map((e) => ({ ...e, direction: true } as Edge));

		return {
			name: 'Or Reduction',
			inputs,
			vertices,
			edges
		};
	};

	const createNotGraph = () => {
		const inputs = writable([false]);

		const vertices = [
			{ id: 1, ...NewInputGate(inputs, 0), x: -100, y: 0 },
			{ id: 2, ...NewNandGate(), x: 0, y: 0 },
			{ id: 3, ...NewOutputGate(0), x: 100, y: 0 }
		] as Gate[];

		const edges = [
			{ source: 1, target: 2, curve: 30 },
			{ source: 1, target: 2, curve: -30 },
			{ source: 2, target: 3 }
		].map((e) => ({ ...e, direction: true } as Edge));

		return {
			name: 'Not Reduction',
			inputs,
			vertices,
			edges
		};
	};

	const graphs = [createAndGraph(), createOrGraph(), createNotGraph()];
</script>

<MultipleCircuits {graphs}>
	<svelte:fragment slot="caption">
		A reduction from the complete basis &#123;∧, ∨, ¬&#125; to &#123;↑&#125;
	</svelte:fragment>
</MultipleCircuits>
