<script lang="ts" context="module">
	import { toSubscript } from '$lib/strings/subscripts';
	import { type Vertex } from '$lib/graphs/Graph.svelte';

	export type GateFunction = (inputs: boolean[]) => boolean;

	export interface Gate extends Vertex {
		// A function that takes an array of boolean inputs, that correspond
		// to the inputs computed to from the incoming edges (by their declaration
		// order), and returns the output of the current gate computation.
		compute: GateFunction;
	}

	const NthInput =
		(getInputs: () => boolean[], n: number): GateFunction =>
		(_: boolean[]): boolean =>
			getInputs()[n];

	export const NewInputGate = (getInputs: () => boolean[], n: number) => ({
		label: `x${toSubscript(n + 1)}`,
		compute: NthInput(getInputs, n)
	});

	const Id: GateFunction = (inputs: boolean[]): boolean => inputs[0];

	export const NewOutputGate = (n: number) => ({
		label: `y${toSubscript(n + 1)}`,
		compute: Id
	});

	const And: GateFunction = (inputs: boolean[]): boolean => inputs.every(Boolean);
	export const NewAndGate = () => ({ label: '∧', compute: And });

	const Or: GateFunction = (inputs: boolean[]): boolean => inputs.some(Boolean);
	export const NewOrGate = () => ({ label: '∨', compute: Or });

	const Not: GateFunction = (inputs: boolean[]): boolean => !inputs[0];
	export const NewNotGate = () => ({ label: '¬', compute: Not });

	const Nand: GateFunction = (inputs: boolean[]): boolean => !And(inputs);
	export const NewNandGate = () => ({ label: '↑', compute: Nand });
</script>

<script lang="ts">
	import FullWidth from '$lib/FullWidth.svelte';
	import Graph, { GraphMode, type Edge } from '$lib/graphs/Graph.svelte';
	import { Color } from '$lib/interfaces/color';
	import { onMount } from 'svelte';
	import BooleanButton from '$lib/logic/BooleanButton.svelte';
	import BooleanTag from '$lib/logic/BooleanTag.svelte';
	import AnimationButton from '$lib/AnimationButton.svelte';

	export const prerender = true;

	export let inputs: boolean[] = [];
	export let vertices: Gate[] = [];
	export let edges: Edge[] = [];

	const getForwardEdges = (g: Gate): Edge[] => edges.filter((e) => e.source === g);

	const getBackwardEdges = (g: Gate): Edge[] => edges.filter((e) => e.target === g);

	const getBackwardGates = (g: Gate): Gate[] => getBackwardEdges(g).map((e) => e.source) as Gate[];

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
	let onInteraction = () => stop();

	const computeFunction = (): boolean[] => {
		let cachedGates = new Map<Gate, boolean>();
		for (const gate of vertices) {
			const state = computeGate(gate, cachedGates);
			setGateState(gate, state);
		}

		refresh();
		return vertices.map((g) => computeGate(g, cachedGates));
	};

	export { computeFunction as refresh };

	const setGateState = (gate: Gate, state: boolean) => {
		gate.color = state ? Color.Red : undefined;
		for (const edge of getForwardEdges(gate)) {
			edge.color = state ? Color.Red : undefined;
		}
	};

	let gateResults = computeFunction();
	$: inputs, vertices, edges, (gateResults = computeFunction());

	const findOutputIndices = (vertices: Gate[], edges: Edge[]): number[] =>
		vertices
			.map((vertex, index) => ({ vertex, index }))
			.filter(
				({ vertex }) => !edges.some((edge) => edge.source === vertex.id || edge.source === vertex)
			)
			.map(({ index }) => index);

	$: outputIndices = findOutputIndices(vertices, edges);

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

<FullWidth bind:width>
	<div class="flex flex-wrap items-center justify-center">
		<Graph
			class="inline-block flex-shrink-0"
			width={graphWidth}
			{edges}
			{vertices}
			vertexLabels={true}
			mode={GraphMode.sticky}
			bind:refresh
			bind:onInteraction
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

			<table class="m-2 inline-block text-center table-fixed">
				<colgroup>
					<col class="w-20" />
					<col class="w-20" />
				</colgroup>

				<tr>
					<th>Output</th>
					<th>Value</th>
				</tr>
				{#each outputIndices as i}
					<tr>
						<td>{vertices[i].label}</td>
						<td>
							<BooleanTag value={gateResults[i]} />
						</td>
					</tr>
				{/each}
			</table>
			<AnimationButton {next} bind:stop />
		</div>
	</div>
</FullWidth>
