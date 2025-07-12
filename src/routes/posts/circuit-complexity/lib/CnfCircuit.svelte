<script lang="ts">
	import TruthTable from '$lib/logic/TruthTable.svelte';
	import Graph, { type Edge, type Vertex } from '$lib/graphs/Graph.svelte';
	import Figure from '$lib/Figure.svelte';
	import AnimationButton from '$lib/AnimationButton.svelte';
	import { bitsToId, idToBits, indexToInputs } from '$lib/logic/booleanGates';
	import { Color } from '$lib/interfaces/color';
	import { toSubscript } from '$lib/strings/subscripts';
	import FullWidth from '$lib/FullWidth.svelte';

	let bits = [true, true, true, false];
	const k = bits.length;
	const n = Math.ceil(Math.log2(k));
	const p = Math.pow(2, k);

	const next = () => {
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

	const inputs = Array.from(
		{ length: n },
		(_, i) => ({ label: `x${toSubscript(i + 1)}` } as Vertex)
	);
	const negations = Array.from(
		{ length: n },
		(_) => ({ label: '¬', color: Color.Yellow } as Vertex)
	);

	const negationEdges = inputs.map((v, i) => ({
		source: v,
		target: negations[i],
		direction: true
	})) as Edge[];

	const createAndClause = (row: number): { vertices: Vertex[]; edges: Edge[] } => {
		const inputValues = indexToInputs(row, n);
		const inputVertices = Array.from({ length: n }, (_, i) =>
			inputValues[i] ? inputs[i] : negations[i]
		);

		return createTree(inputVertices, { label: '∨', color: Color.Green });
	};

	const createAllClauses = (): { vertices: Vertex[]; edges: Edge[] } => {
		const vertices = [] as Vertex[];
		const edges = [] as Edge[];

		const orSources = [] as Vertex[];

		for (let i = 0; i < k; i++) {
			if (!bits[i]) continue; // Skip clauses for which the bit is true
			const { vertices: clauseVertices, edges: clauseEdges } = createAndClause(i);
			vertices.push(...clauseVertices);
			edges.push(...clauseEdges);

			orSources.push(clauseVertices[clauseVertices.length - 1]);
		}

		const { vertices: orVertices, edges: orEdges } = createTree(orSources, {
			label: '∧',
			color: Color.Blue
		});
		vertices.push(...orVertices);
		edges.push(...orEdges);

		const target = { label: 'y₁' } as Vertex;
		vertices.push(target);
		edges.push({ source: orVertices[orVertices.length - 1], target, direction: true });

		return { vertices, edges };
	};

	let { vertices: clauseVertices, edges: clauseEdges } = createAllClauses();

	$: vertices = [...inputs, ...negations, ...clauseVertices];
	$: edges = [...negationEdges, ...clauseEdges];

	let width: number;
	$: responsiveWidth = Math.min(width - 280, 550);
	$: graphWidth = responsiveWidth > 200 ? responsiveWidth : width;
</script>

<FullWidth bind:width>
	<Figure>
		<div slot="content" class="flex flex-wrap items-center justify-center">
			<Graph width={graphWidth} {vertices} {edges} />
			<div>
				<TruthTable title="y₁" {select} {bits} />
				<AnimationButton bind:stop {next} />
			</div>
		</div>
		<svelte:fragment slot="caption">
			CNF circuits over the basis &#123;∧, ∨, ¬&#125; computing all functions in B₂
		</svelte:fragment>
	</Figure>
</FullWidth>
