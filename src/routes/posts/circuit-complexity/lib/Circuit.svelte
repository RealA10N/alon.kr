<script lang="ts">
	import Graph from '$lib/graphs/Graph.svelte';
	import Figure from '$lib/Figure.svelte';
	import FullWidth from '$lib/FullWidth.svelte';
	import { GraphMode, type Edge, type Vertex } from '$lib/graphs/graphs';
	import { Color } from '$lib/interfaces/color';
	import { onMount } from 'svelte';
	import BooleanButton from './BooleanButton.svelte';
	import BooleanTag from './BooleanTag.svelte';

	export const prerender = true;

	type GateFunction = (inputs: boolean[]) => boolean;

	interface Gate extends Vertex {
		compute: GateFunction;
	}

	let inputs: boolean[] = [false, false, false];

	const And = (inputs: boolean[]): boolean => inputs.every(Boolean);
	const Or = (inputs: boolean[]): boolean => inputs.some(Boolean);
	const Not = (inputs: boolean[]): boolean => !inputs[0];
	const Id = (inputs: boolean[]): boolean => inputs[0];

	const NthInput =
		(n: number) =>
		(_: boolean[]): boolean =>
			inputs[n];

	let vertices: Gate[] = [
		{ id: 1, label: 'x₁', compute: NthInput(0), x: -92, y: -127 },
		{ id: 2, label: 'x₂', compute: NthInput(1), x: -57, y: -65 },
		{ id: 3, label: 'x₃', compute: NthInput(2), x: -38, y: 151 },
		{ id: 4, label: '∧', compute: And, x: 40, y: -136 },
		{ id: 5, label: '∨', compute: Or, x: -165, y: -16 },
		{ id: 6, label: '¬', compute: Not, x: 16, y: -14 },
		{ id: 7, label: '∧', compute: And, x: -69, y: 75 },
		{ id: 8, label: '∧', compute: And, x: 64, y: 87 },
		{ id: 9, label: '∨', compute: Or, x: 125, y: -32 },
		{ id: 10, label: 'y₁', compute: Id, x: 176, y: 79 }
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

	const computeFunction = (): boolean[] => {
		let cachedGates = new Map<Gate, boolean>();
		for (const gate of vertices) {
			const state = computeGate(gate, cachedGates);
			setGateState(gate, state);
		}

		edges = [...edges]; // To trigger reactivity.
		return vertices.map((g) => computeGate(g, cachedGates));
	};

	const setGateState = (gate: Gate, state: boolean) => {
		gate.color = state ? Color.Red : undefined;
		for (const edge of getForwardEdges(gate)) {
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
	].map((e) => ({ ...e, direction: true } as Edge));

	let gateResults = computeFunction();
	$: inputs, vertices, edges, (gateResults = computeFunction());

	const outputIndices: number[] = [9];
	$: outputs = outputIndices.map((i) => gateResults[i]);

	onMount(computeFunction);

	let width: number;
	$: graphWidth = Math.min(width, 460);
</script>

<Figure>
	<FullWidth slot="content" bind:width>
		<div class="flex flex-wrap items-center justify-center">
			<Graph
				class="inline-block flex-shrink-0"
				width={graphWidth}
				{edges}
				{vertices}
				vertexLabels={true}
				mode={GraphMode.regular}
			/>

			<div class="flex flex-row sm:flex-col items-start">
				<table class="m-2 inline-block table-fixed">
					<colgroup>
						<col class="w-20" />
						<col class="w-20" />
					</colgroup>
					<tr>
						<th class="text-center">Input</th>
						<th class="text-center">Value</th>
					</tr>
					{#each inputs as input, i}
						<tr>
							<td class="text-center">x<sub>{i + 1}</sub></td>
							<td>
								<BooleanButton bind:value={input} />
							</td>
						</tr>
					{/each}
				</table>

				<table class="m-2 inline-block table-fixed">
					<colgroup>
						<col class="w-20" />
						<col class="w-20" />
					</colgroup>

					<tr>
						<th class="text-center">Output</th>
						<th class="text-center">Value</th>
					</tr>
					{#each outputs as output, i}
						<tr>
							<td class="text-center">y<sub>{i + 1}</sub></td>
							<td>
								<BooleanTag value={output} />
							</td>
						</tr>
					{/each}
				</table>
			</div>
		</div>
	</FullWidth>

	<svelte:fragment slot="caption">
		A circuit with 6 internal gates over the basis &#123;∧, ∨, ¬&#125; computing the Th<sub>2</sub> function:
		The output bit is on if at least two of the input bits are on.
	</svelte:fragment>
</Figure>
