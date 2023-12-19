<script lang="ts">
	import Graph from '$lib/Graph.svelte';
	import Figure from '$lib/Figure.svelte';

	import { edges, vertices } from './graphWithMst';
	import FullWidth from '$src/lib/FullWidth.svelte';
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
