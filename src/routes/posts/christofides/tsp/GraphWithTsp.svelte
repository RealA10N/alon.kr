<script lang="ts">
	import Graph from '$lib/Graph.svelte';
	import { onMount } from 'svelte';
	import { GraphMode, type Edge, type Vertex } from '$src/lib/interfaces/graph';
	import { BinaryHeap } from 'structurae';
	import blossom from 'edmonds-blossom-fixed';

	const n = 30;

	const initWidth = 650;
	const initHeight = 350;

	export let vertices: Vertex[] = [];
	export let edges: Edge[] = [];

	function randomPosition(range: number) {
		return Math.floor(Math.random() * range) - range / 2;
	}

	function randomInitNode(): Vertex {
		return {
			x: randomPosition(initWidth),
			y: randomPosition(initHeight)
		} as Vertex;
	}

	export function randomizeNodes() {
		vertices = Array.from({ length: n }, (_, i) => randomInitNode());
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

	function getNeighborsVertices(vertex: Vertex, graph: Edge[]): Vertex[] {
		const sources = graph.filter((e) => e.source == vertex).map((e) => e.target as Vertex);
		const targets = graph.filter((e) => e.target == vertex).map((e) => e.source as Vertex);
		return [...sources, ...targets];
	}

	function dfs(graph: Edge[]): Vertex[] {
		const traversal = new Array<Vertex>();
		const stack = new Array<Vertex>(vertices[0]);

		while (stack.length) {
			const top = stack.pop();
			if (traversal.includes(top)) continue;
			traversal.push(top);
			stack.push(...getNeighborsVertices(top, graph));
		}

		return traversal;
	}

	function filterOddVertices(graph: Edge[]): Vertex[] {
		const counter = new Map<Vertex, number>();
		for (const edge of graph) {
			const s = edge.source as Vertex;
			counter.set(s, (counter.get(s) ?? 0) + 1);
			const t = edge.target as Vertex;
			counter.set(t, (counter.get(t) ?? 0) + 1);
		}

		for (let v in vertices) {
			vertices[v].highlight = Boolean(counter.get(vertices[v]) % 2);
		}

		return Array.from(counter.entries())
			.filter(([v, k]) => k % 2 === 1)
			.map(([v, k]) => v);
	}

	function getMinPerfectMatching(vertices: Vertex[]) {
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

	export function calculateTsp() {
		const mst = calculateMst();
		const odds = filterOddVertices(mst);
		const evenGraph = [...mst, ...getMinPerfectMatching(odds)];
		const tour = eularianTour(evenGraph);
		const edges: Edge[] = [];
		for (let i = 0; i < tour.length; i++) {
			edges.push(getEdge(tour[i], tour[(i + 1) % tour.length]));
		}
		return edges;
	}

	let width: number;

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
		<button
			on:click={() => {
				randomizeNodes();
				edges = calculateTsp();
			}}>randomize</button
		>
		<button on:click={() => (edges = calculateTsp())}>Show TSP</button>
		<button on:click={() => (edges = calculateMst())}>Show MST</button>
		<button on:click={() => (edges = getMinPerfectMatching(filterOddVertices(calculateMst())))}
			>Show MPM</button
		>
	</div>
	<figcaption>
		A demonstration of the TSP Problem: The distance between any two vertices is the Euclidean
		distance between them. The highlighted cycle is an approximation of the optimal TSP cycle.
	</figcaption>
</figure>

<style>
	.graph-container {
		width: 100vw;
		position: relative;
		left: calc(-50vw + 50%);
	}
</style>
