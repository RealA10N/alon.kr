<!--



g0 = AND(x3, x2)
g1 = OR(x3, x2)
g2 = AND(x1, g1)
g3 = OR(x3, x4)
g4 = NOT(g2)
g5 = AND(g4, g3)
g6 = AND(x4, g0)
g7 = OR(g6, g5)
g8 = AND(x1, g7)
y1
y2

2 5
3 5
2 6
3 6
1 7
6 7
3 8
4 8
7 9
8 10
9 10
4 11
5 11
10 12
11 12
1 13
12 13
13 14
12 15

Outputs:
y1 = g8
y2 = g7
-->
<script lang="ts">
	import Graph from '$lib/graphs/Graph.svelte';
	import Figure from '$lib/Figure.svelte';
	import FullWidth from '$lib/FullWidth.svelte';
	import { GraphMode, type Edge, type Vertex } from '$lib/graphs/graphs';
	import { Color } from '$lib/interfaces/color';
	import { onMount } from 'svelte';
	import BooleanButton from '$lib/logic/BooleanButton.svelte';
	import BooleanTag from '$lib/logic/BooleanTag.svelte';
	import AnimationButton from '$lib/AnimationButton.svelte';

	export const prerender = true;

	type GateFunction = (inputs: boolean[]) => boolean;

	interface Gate extends Vertex {
		compute: GateFunction;
	}

	let inputs: boolean[] = [false, false, false, false];

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
		{ id: 4, label: 'x₄', compute: NthInput(3), x: -38, y: 151 },
		{ id: 5, label: '∧', compute: And, x: 40, y: -136 },
		{ id: 6, label: '∨', compute: Or, x: -165, y: -16 },
		{ id: 7, label: '∧', compute: And, x: 16, y: -14 },
		{ id: 8, label: '∨', compute: Or, x: -69, y: 75 },
		{ id: 9, label: '¬', compute: Not, x: 64, y: 87 },
		{ id: 10, label: '∧', compute: And, x: 125, y: -32 },
		{ id: 11, label: '∧', compute: And, x: 125, y: -32 },
		{ id: 12, label: '∨', compute: Or, x: 125, y: -32 },
		{ id: 13, label: '∧', compute: And, x: 125, y: -32 },
		{ id: 14, label: 'y₁', compute: Or, x: 125, y: -32 },
		{ id: 15, label: 'y₂', compute: Or, x: 125, y: -32 }
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

	let refresh = () => {};

	const computeFunction = (): boolean[] => {
		let cachedGates = new Map<Gate, boolean>();
		for (const gate of vertices) {
			const state = computeGate(gate, cachedGates);
			setGateState(gate, state);
		}

		refresh();
		return vertices.map((g) => computeGate(g, cachedGates));
	};

	const setGateState = (gate: Gate, state: boolean) => {
		gate.color = state ? Color.Red : undefined;
		for (const edge of getForwardEdges(gate)) {
			edge.color = state ? Color.Red : undefined;
		}
	};

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

	let gateResults = computeFunction();
	$: inputs, vertices, edges, (gateResults = computeFunction());

	const outputIndices: number[] = [13, 14];
	$: outputs = outputIndices.map((i) => gateResults[i]);

	const inputsToNumber = (inputs: boolean[]): number => {
		return inputs.reduce((acc, input, i) => acc + (input ? 1 << i : 0), 0);
	};

	const numberToInputs = (number: number): boolean[] => {
		return Array.from({ length: inputs.length }, (_, i) => Boolean(number & (1 << i)));
	};

	const next = () => {
		let n = inputsToNumber(inputs);
		n += 1;
		n %= 1 << inputs.length;
		inputs = numberToInputs(n);
	};

	let stop = () => {};

	onMount(computeFunction);

	let width: number;
	$: responsiveWidth = Math.min(width - 280, 550);
	$: graphWidth = responsiveWidth > 200 ? responsiveWidth : width;
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
				mode={GraphMode.sticky}
				bind:refresh
			/>

			<div class="flex flex-col items-center justify-center">
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
								<BooleanButton
									onClick={() => {
										stop();
										input = !input;
									}}
									bind:value={input}
								/>
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
				<AnimationButton {next} bind:stop />
			</div>
		</div>
	</FullWidth>

	<svelte:fragment slot="caption">
		A circuit with 9 internal gates over the basis &#123;∧, ∨, ¬&#125; computing the smallest factor
		of integers up to 15.
	</svelte:fragment>
</Figure>
