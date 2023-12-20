<script lang="ts">
	import Graph from '$lib/graphs/Graph.svelte';
	import Figure from '$lib/Figure.svelte';
	import FullWidth from '$lib/FullWidth.svelte';
	import { Color, type Edge, type Vertex } from '$lib/graphs/graphs';

	export const prerender = true;

	const edges: Edge[] = [
		{ source: 1, target: 2 },
		{ source: 2, target: 3 },
		{ source: 3, target: 4 },
		{ source: 4, target: 5 },
		{ source: 5, target: 6 },
		{ source: 6, target: 7 },
		{ source: 7, target: 8 },
		{ source: 8, target: 1 }
	].map((e) => ({ ...e, ...(e.source & 1 ? { highlight: true, color: Color.Red } : {}) } as Edge));

	const vertices: Vertex[] = [
		{ id: 1, label: '1', x: 0, y: -100 },
		{ id: 2, label: '2', x: 50, y: -50 },
		{ id: 3, label: '3', x: 100, y: 0 },
		{ id: 4, label: '4', x: 50, y: 50 },
		{ id: 5, label: '5', x: 0, y: 100 },
		{ id: 6, label: '6', x: -50, y: 50 },
		{ id: 7, label: '7', x: -100, y: 0 },
		{ id: 8, label: '8', x: -50, y: -50 }
	].map((v) => ({ ...v, highlight: true, color: Color.Red } as Vertex));
	let width: number;
</script>

<Figure>
	<FullWidth slot="content" bind:width>
		<Graph {width} {edges} {vertices} vertexLabels={true} gravity={true} sticky={false} />
	</FullWidth>
	<svelte:fragment slot="caption">
		An example of a cycle C' of length 8 with the matching M<sub>1</sub> highlighted
	</svelte:fragment>
</Figure>
