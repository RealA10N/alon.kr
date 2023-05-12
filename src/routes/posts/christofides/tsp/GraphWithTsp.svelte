<script lang="ts">
	import Graph from '$lib/Graph.svelte';
	import { onMount } from 'svelte';
	import { GraphMode, type Edge, type Vertex } from '$src/lib/interfaces/graph';
	import { BinaryHeap } from 'structurae';
	import blossom from 'edmonds-blossom-fixed';

	const n = 25,
		maxWidth = 650,
		height = 350;
	let width: number; // bounded to the width of the svg

	export let vertices: Vertex[] = [];
	export let edges: Edge[] = [];

	function randomPosition(range: number) {
		return Math.floor(Math.random() * range) - range / 2;
	}

	function randomInitNode(): Vertex {
		return {
			x: randomPosition(Math.min(maxWidth, width) - 100),
			y: randomPosition(height)
		} as Vertex;
	}

	export function randomizeNodes() {
		vertices = Array.from({ length: n }, (_, i) => randomInitNode());
		edges = [];
	}

	class EdgesMinQueue extends BinaryHeap<Edge> {}
	EdgesMinQueue.compare = (a: Edge, b: Edge) => a.weight < b.weight;

	function getEdge(source: Vertex, target: Vertex): Edge {
		return {
			source: source,
			target: target,
			weight: Math.sqrt(
				(source.x - target.x) * (source.x - target.x) +
					(source.y - target.y) * (source.y - target.y)
			)
		} as Edge;
	}

	function getNeighbors(source: Vertex): Edge[] {
		return vertices.map((target) => getEdge(source, target));
	}

	export function calculateMst(): Edge[] {
		const mstEdges = new Array<Edge>();

		const visited = new BinaryHeap<Vertex>(vertices[0]);
		const queue = new EdgesMinQueue(...getNeighbors(vertices[0]));

		while (queue.length) {
			const minEdge = queue.shift()!;

			if (!visited.includes(minEdge.target as Vertex)) {
				mstEdges.push(minEdge);
				visited.push(minEdge.target as Vertex);
				queue.push(...getNeighbors(minEdge.target as Vertex));
			}
		}

		return mstEdges;
	}

	function filterOddVertices(graph: Edge[]): Vertex[] {
		const counter = new Map<Vertex, number>();
		for (const edge of graph) {
			const s = edge.source as Vertex;
			counter.set(s, (counter.get(s) ?? 0) + 1);
			const t = edge.target as Vertex;
			counter.set(t, (counter.get(t) ?? 0) + 1);
		}

		return Array.from(counter.entries())
			.filter(([v, k]) => k % 2 === 1)
			.map(([v, k]) => v);
	}

	function calculateMpm(vertices: Vertex[]): Edge[] {
		const edges = [];
		const k = vertices.length;
		for (let i = 0; i < k; i++)
			for (let j = i + 1; j < k; j++)
				edges.push([i, j, Math.floor(10_000_000 - getEdge(vertices[i], vertices[j]).weight ?? 0)]);
		const matching = blossom(edges);
		const matchingEdges = [];
		for (let i in vertices) {
			const j = matching[i];

			if (i < j) {
				const e = getEdge(vertices[i], vertices[j]);
				e.highlight = true;
				matchingEdges.push(e);
			}
		}
		return matchingEdges;
	}

	function eularianCycle(graph: Edge[], v: Vertex): Vertex[] {
		const cycle: Vertex[] = [];

		while (graph.length > 0) {
			const edgeIndex = graph.findIndex((e) => e.source === v || e.target === v);
			if (edgeIndex == -1) return cycle;
			const edge = graph[edgeIndex];
			const next = (edge?.source === v ? edge?.target : edge?.source) as Vertex;
			graph.splice(edgeIndex, 1);
			cycle.push(next);
			v = next;
		}

		return cycle;
	}

	function eularianTour(graph: Edge[]): Vertex[] {
		if (graph.length === 0) return [];

		let tour: Vertex[] = eularianCycle(graph, graph[0].source as Vertex);

		while (graph.length > 0) {
			const index = tour.findIndex(
				(v) => graph.map((e) => e.source).includes(v) || graph.map((e) => e.target).includes(v)
			);
			const cycle = eularianCycle(graph, tour[index]);
			tour = [...tour.slice(0, index), ...cycle, ...tour.slice(index)];
		}

		return tour.filter((value, index, array) => array.indexOf(value) === index);
	}

	function calculateTsp() {
		const mst = calculateMst();
		const odds = filterOddVertices(mst);
		const evenGraph = [...mst, ...calculateMpm(odds)];
		const tour = eularianTour(evenGraph);
		const edges: Edge[] = [];
		for (let i = 0; i < tour.length; i++) {
			edges.push(getEdge(tour[i], tour[(i + 1) % tour.length]));
		}
		return edges;
	}

	function showTsp() {
		edges = calculateTsp();
		highlightVertices([]);
	}

	function highlightVertices(toHighlight: Vertex[]) {
		for (const v of vertices) v.highlight = toHighlight.includes(v);
	}

	function highlightEdges(toHighlight: Edge[]) {
		for (const e of edges) e.highlight = toHighlight.includes(e);
	}

	function showMst() {
		edges = calculateMst();
		highlightVertices(filterOddVertices(edges));
	}

	function showMpm() {
		const odds = filterOddVertices(calculateMst());
		edges = calculateMpm(odds);
		highlightVertices(odds);
		highlightEdges(edges);
	}

	onMount(randomizeNodes);
</script>

<figure bind:clientWidth={width} class="graph-container">
	<Graph
		{width}
		{edges}
		{vertices}
		vertexLabels={true}
		edgeLabels={false}
		gravity={false}
		mode={GraphMode.regular}
		radius={5}
	/>
	<div class="text-center">
		<button on:click={randomizeNodes}>Randomize</button>
		<button on:click={showTsp}>Approximated TSP</button>
		<button on:click={showMst}>MST</button>
		<button on:click={showMpm}>Matching</button>
	</div>
	<figcaption>
		A demonstration of the TSP Problem: The distance between any two vertices is the Euclidean
		distance between them. Using Christofides' algorithm to calculate a 1.5-approximation.
	</figcaption>
</figure>

<style>
	.graph-container {
		width: 100vw;
		position: relative;
		left: calc(-50vw + 50%);
	}
</style>
