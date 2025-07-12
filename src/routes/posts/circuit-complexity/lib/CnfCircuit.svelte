<script lang="ts">
	import TruthTable from '$lib/logic/TruthTable.svelte';
	import { type Edge, type Vertex } from '$lib/graphs/Graph.svelte';
	import Graph from '$lib/graphs/Graph.svelte';
	import Figure from '$lib/Figure.svelte';
	import AnimationButton from '$lib/AnimationButton.svelte';
	import { bitsToId, idToBits, indexToInputs } from '$lib/logic/booleanGates';
	import { Color } from '$lib/interfaces/color';
	import { toSubscript } from '$lib/strings/subscripts';
	import FullWidth from '$lib/FullWidth.svelte';

	let bits = [false, false, false, false];
	$: k = bits.length;
	$: n = Math.ceil(Math.log2(k));

	const next = () => {
		const k = bits.length;
		const p = Math.pow(2, bits.length);
		bits = idToBits((bitsToId(bits) + 1) % p, k);
	};

	const select = (newBits: boolean[]) => (stop(), (bits = newBits));

	let stop = () => {};

	type VertexProperties = {
		color?: Color;
		label?: string | number;
		highlight?: boolean;
	};

	const createTree = (
		children: Vertex[],
		properties: VertexProperties = {}
	): { vertices: Vertex[]; edges: Edge[] } => {
		// The strategy is to connect the first ceil(n/2) vertices to one another,
		// and then call the function recursively with the remaining ones.

		if (children.length <= 1) {
			return {
				vertices: children,
				edges: []
			};
		}

		let vertices: Vertex[] = [];
		let edges: Edge[] = [];

		for (let i = 0; i < children.length - 1; i += 2) {
			const v = { ...properties } as Vertex;
			vertices.push(v);
			edges.push({ source: children[i], target: v, direction: true });
			edges.push({ source: children[i + 1], target: v, direction: true });
		}

		if (children.length % 2 === 1) {
			vertices.push(children[children.length - 1]);
		}

		const { vertices: newVertices, edges: newEdges } = createTree(vertices, properties);
		return {
			vertices: [...vertices, ...newVertices],
			edges: [...edges, ...newEdges]
		};
	};

	const isFalseFunction = (bits: boolean[]) => bits.every((b) => !b);

	const createInputVertex = (i: number) => ({ label: `x${toSubscript(i + 1)}` } as Vertex);

	const createNegationVertex = (v: Vertex): { v: Vertex; e: Edge } => {
		const neg = { label: '¬' } as Vertex;
		const edge = { source: v, target: neg, direction: true } as Edge;
		return { v: neg, e: edge };
	};

	const createTargetVertex = (): Vertex => ({ label: 'y₁' } as Vertex);

	const createAndVertex = () => ({ label: '∧' } as Vertex);

	const createFalseFunction = (): { vertices: Vertex[]; edges: Edge[] } => {
		const input = createInputVertex(0);
		const { v: neg, e: negEdge } = createNegationVertex(input);
		const target = createTargetVertex();
		const and = createAndVertex();

		const inputToAnd = { source: input, target: and, direction: true } as Edge;
		const negToAnd = { source: neg, target: and, direction: true } as Edge;
		const andToTarget = { source: and, target: target, direction: true } as Edge;

		return {
			vertices: [input, neg, target, and],
			edges: [negEdge, inputToAnd, negToAnd, andToTarget]
		};
	};

	const createCnfGraph = (bits: boolean[]): { vertices: Vertex[]; edges: Edge[] } => {
		if (isFalseFunction(bits)) return createFalseFunction();

		const inputs = Array.from({ length: n }, (_, i) => createInputVertex(i));
		const negations = inputs.map((v) => createNegationVertex(v));
		const negationVertices = negations.map((n) => n.v);
		const negationEdges = negations.map((n) => n.e);

		let { vertices: clauseVertices, edges: clauseEdges } = createAllClauses(
			bits,
			inputs,
			negationVertices
		);

		return {
			vertices: [...inputs, ...negationVertices, ...clauseVertices],
			edges: [...negationEdges, ...clauseEdges]
		};
	};

	const createAndClause = (
		row: number,
		inputs: Vertex[],
		negations: Vertex[]
	): { vertices: Vertex[]; edges: Edge[] } => {
		const inputValues = indexToInputs(row, n);
		const inputVertices = Array.from({ length: n }, (_, i) =>
			inputValues[i] ? inputs[i] : negations[i]
		);

		return createTree(inputVertices, createAndVertex());
	};

	const createAllClauses = (
		bits: boolean[],
		inputs: Vertex[],
		negations: Vertex[]
	): { vertices: Vertex[]; edges: Edge[] } => {
		const vertices = [] as Vertex[];
		const edges = [] as Edge[];

		const orSources = [] as Vertex[];

		for (let i = 0; i < bits.length; i++) {
			if (!bits[i]) continue; // Skip clauses for which the bit is true
			const { vertices: clauseVertices, edges: clauseEdges } = createAndClause(
				i,
				inputs,
				negations
			);
			vertices.push(...clauseVertices);
			edges.push(...clauseEdges);

			orSources.push(clauseVertices[clauseVertices.length - 1]);
		}

		const { vertices: orVertices, edges: orEdges } = createTree(orSources, {
			label: '∨'
		});

		vertices.push(...orVertices);
		edges.push(...orEdges);

		const target = createTargetVertex();
		vertices.push(target);
		edges.push({ source: orVertices[orVertices.length - 1], target, direction: true });

		return { vertices, edges };
	};

	let vertices = [] as Vertex[];
	let edges = [] as Edge[];
	let refresh = () => {};
	$: ({ vertices, edges } = createCnfGraph(bits)), refresh();

	let width: number;
	$: responsiveWidth = Math.min(width - 280, 550);
	$: graphWidth = responsiveWidth > 200 ? responsiveWidth : width;
</script>

<FullWidth bind:width>
	<Figure>
		<div slot="content" class="flex flex-wrap items-center justify-center">
			<Graph width={graphWidth} {vertices} {edges} bind:refresh />
			<div>
				<TruthTable title="y₁" {select} {bits} />
				<AnimationButton bind:stop {next} />
			</div>
		</div>
		<svelte:fragment slot="caption"
			>CNF circuits over the basis &#123;∧, ∨, ¬&#125; computing computing all functions in B₂.
		</svelte:fragment>
	</Figure>
</FullWidth>
