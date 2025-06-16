<script lang="ts">
	import Graph from '$lib/graphs/Graph.svelte';
	import Figure from '$lib/Figure.svelte';
	import FullWidth from '$lib/FullWidth.svelte';
	import { GraphMode, type Edge, type Vertex } from '$lib/graphs/graphs';
	import { Color } from '$lib/interfaces/color';
	import { onMount } from 'svelte';

	export const prerender = true;

	type GateFunction = (inputs: boolean[]) => boolean;

	interface Gate extends Vertex {
		compute: GateFunction;
	}

	let inputs: boolean[] = [false, false, false];

	const randomizeInputs = () => {
		inputs = Array.from({ length: 3 }, () => Math.random() < 0.5);
		computeFunction();
	};

	const And = (inputs: boolean[]): boolean => inputs.every(Boolean);
	const Or = (inputs: boolean[]): boolean => inputs.some(Boolean);
	const Not = (inputs: boolean[]): boolean => !inputs[0];
	const Id = (inputs: boolean[]): boolean => inputs[0];

	const NthInput =
		(n: number) =>
		(_: boolean[]): boolean =>
			inputs[n];

	let vertices: Gate[] = [
		{ id: 1, label: 'x₁', compute: NthInput(0), x: -50, y: -150 },
		{ id: 2, label: 'x₂', compute: NthInput(1), x: 0, y: -150 },
		{ id: 3, label: 'x₃', compute: NthInput(2), x: 50, y: -150 },
		{ id: 4, label: '∧', compute: And, x: 0, y: 0 },
		{ id: 5, label: '∨', compute: Or, x: 0, y: 0 },
		{ id: 6, label: '¬', compute: Not, x: 0, y: 0 },
		{ id: 7, label: '∧', compute: And, x: 0, y: 0 },
		{ id: 8, label: '∧', compute: And, x: 0, y: 0 },
		{ id: 9, label: '∨', compute: Or, x: 0, y: 0 },
		{ id: 10, label: 'y₁', compute: Id, x: 0, y: 150 }
	].map((v) => ({ ...v, color: Color.Red } as Gate));

	const getForwardEdges = (g: Gate): Edge[] => {
		return edges.filter((e) => e.source === g);
	};

	const getBackwardEdges = (g: Gate): Edge[] => {
		return edges.filter((e) => e.target === g);
	};

	const getBackwardGates = (g: Gate): Gate[] => {
		return getBackwardEdges(g).map((e) => e.source) as Gate[];
	};

	const computeGate = (g: Gate, gateCaches: Map<Gate, boolean>) => {
		const cachedGates = gateCaches.get(g);
		if (cachedGates !== undefined) {
			return cachedGates;
		}

		const inputGates = getBackwardGates(g);
		const inputs = inputGates.map((g) => computeGate(g, gateCaches));

		const result = g.compute(inputs);
		gateCaches.set(g, result);
		return result;
	};

	const computeFunction = () => {
		let cachedGates = new Map<Gate, boolean>();
		for (const gate of vertices) {
			const state = computeGate(gate, cachedGates);
			setGateState(gate, state);
		}

		edges = [...edges]; // To trigger reactivity.
	};

	const setGateState = (gate: Gate, state: boolean) => {
		// gate.highlight = state;
		gate.color = state ? Color.Red : undefined;

		for (const edge of getForwardEdges(gate)) {
			// edge.highlight = state;
			edge.color = state ? Color.Red : undefined;
		}
	};

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
	].map(
		(e) =>
			({
				...e,
				...{ color: Color.Red, direction: true }
			} as Edge)
	);

	let width: number;

	$: inputs, vertices, edges, computeFunction();
	onMount(computeFunction);
</script>

<Figure>
	<FullWidth slot="content" bind:width>
		<Graph {width} {edges} {vertices} vertexLabels={true} mode={GraphMode.regular} />
	</FullWidth>
	<button slot="buttons" on:click={randomizeInputs}>Randomize Inputs</button>
	<svelte:fragment slot="caption">
		A circuit with 6 internal gates over the basis &#123;∧, ∨, ¬&#125; computing the Th<sub>2</sub> function:
		The output bit is on if at least two of the input bits are on.
	</svelte:fragment>
</Figure>
