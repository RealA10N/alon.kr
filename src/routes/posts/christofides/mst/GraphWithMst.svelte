<script lang="ts">
	import Graph from '$lib/graphs/Graph.svelte';
	import Figure from '$lib/Figure.svelte';
	import FullWidth from '$lib/FullWidth.svelte';
	import { edges, vertices } from './graphWithMst';
	let width: number;
</script>

<Figure>
	<FullWidth slot="content" bind:width>
		<Graph {width} {edges} {vertices} vertexLabels={false} gravity={true} sticky={false} />
	</FullWidth>
	<svelte:fragment slot="caption">
		A weighted graph with his minimum spanning tree highlighted
	</svelte:fragment>
</Figure>
