<script lang="ts">
	import Graph from '$lib/Graph.svelte';
	import { edges, vertices } from './graphWithMst';
	let width: number;
</script>

<figure bind:clientWidth={width} class="graph-container">
	<Graph {width} {edges} {vertices} vertexLabels={false} gravity={true} />
	<figcaption>A weighted graph with his minimum spanning tree highlighted</figcaption>
</figure>

<style>
	.graph-container {
		width: 100vw;
		position: relative;
		left: calc(-50vw + 50%);
	}
</style>
