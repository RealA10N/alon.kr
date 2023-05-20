<script lang="ts">
	import Graph from '$lib/Graph.svelte';
	import type { Edge, Vertex } from '$src/lib/interfaces/graph';

	export const prerender = true;

	const edges: Edge[] = [
		{ source: 1, target: 2, highlight: true },
		{ source: 2, target: 3 },
		{ source: 3, target: 4, highlight: true },
		{ source: 4, target: 5 },
		{ source: 5, target: 6, highlight: true },
		{ source: 6, target: 7 },
		{ source: 7, target: 8, highlight: true },
		{ source: 8, target: 1 }
	];

	const vertices: Vertex[] = [
		{ id: 1, highlight: true, label: '1', x: 0, y: -100 },
		{ id: 2, highlight: true, label: '2', x: 50, y: -50 },
		{ id: 3, highlight: true, label: '3', x: 100, y: 0 },
		{ id: 4, highlight: true, label: '4', x: 50, y: 50 },
		{ id: 5, highlight: true, label: '5', x: 0, y: 100 },
		{ id: 6, highlight: true, label: '6', x: -50, y: 50 },
		{ id: 7, highlight: true, label: '7', x: -100, y: 0 },
		{ id: 8, highlight: true, label: '8', x: -50, y: -50 }
	];
	let width: number;
</script>

<figure bind:clientWidth={width} class="graph-container">
	<Graph {width} {edges} {vertices} vertexLabels={true} gravity={true} sticky={false} />
	<figcaption>
		An example of a cycle C' of length 8 with the matching M<sub>1</sub> highlighted
	</figcaption>
</figure>

<style>
	.graph-container {
		width: 100vw;
		position: relative;
		left: calc(-50vw + 50%);
	}
</style>
