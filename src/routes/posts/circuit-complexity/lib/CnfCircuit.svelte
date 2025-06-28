<script lang="ts">
	import TruthTable from '$lib/logic/TruthTable.svelte';
	import Graph, { type Edge, type Vertex } from '$lib/graphs/Graph.svelte';
	import Figure from '$lib/Figure.svelte';
	import AnimationButton from '$lib/AnimationButton.svelte';
	import { bitsToId, idToBits } from '$src/lib/logic/booleanGates';

	let bits = [false, false, false, false];
	let n = bits.length;
	let k = Math.pow(2, n);

	const next = () => {
		bits = idToBits((bitsToId(bits) + 1) % k, n);
	};

	const select = (newBits: boolean[]) => (stop(), (bits = newBits));

	let stop = () => {};

	const createAndTree = (
		children: Vertex[],
		nextId: number
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
			const v = { id: nextId++, label: '∨' } as Vertex;
			vertices.push(v);
			edges.push({ source: children[i], target: v, direction: true });
			edges.push({ source: children[i + 1], target: v, direction: true });
		}

		if (children.length % 2 === 1) {
			vertices.push(children[children.length - 1]);
		}

		const { vertices: newVertices, edges: newEdges } = createAndTree(vertices, nextId);
		return {
			vertices: [...vertices, ...newVertices],
			edges: [...edges, ...newEdges]
		};
	};

	let sourceVertices = [
		{ id: 1, label: '1' },
		{ id: 2, label: '2' },
		{ id: 3, label: '3' },
		{ id: 4, label: '4' }
	];

	let { vertices: newVertices, edges } = createAndTree(sourceVertices, 6);
	let vertices: Vertex[] = [...sourceVertices, ...newVertices];
</script>

<Figure>
	<div slot="content" class="flex flex-row justify-center items-center">
		<Graph {vertices} {edges} />
		<div>
			<TruthTable title="y₁" {select} {bits} />
			<AnimationButton bind:stop {next} />
		</div>
	</div>
	<svelte:fragment slot="caption"
		>CNF circuits over the basis &#123;∧, ∨, ¬&#125; computing computing all functions with 2
		inputs.
	</svelte:fragment>
</Figure>
