import type { Edge, Vertex } from '$lib/graphs/graphs';
import { Color } from '$lib/interfaces/color';

export const prerender = true;

export const edges: Edge[] = [
	{ source: 4, target: 6, label: 1 },
	{ source: 7, target: 6, label: 3 },
	{ source: 7, target: 2, label: 4 },
	{ source: 1, target: 2, label: 5 },
	{ source: 1, target: 3, label: 6 },
	{ source: 8, target: 1, label: 7 },
	{ source: 4, target: 3, label: 8 },
	{ source: 4, target: 2, label: 9 },
	{ source: 4, target: 5, label: 10 },
	{ source: 7, target: 4, label: 11 },
	{ source: 1, target: 7, label: 12 },
	{ source: 2, target: 3, label: 13 }
];

export const vertices: Vertex[] = [
	{ id: 1, y: 0, x: 200 },
	{ id: 2, y: 0, x: 0 },
	{ id: 3, y: 100, x: -100 },
	{ id: 4, y: 0, x: -100 },
	{ id: 5, y: 0, x: -200 },
	{ id: 6, y: -150, x: 0 },
	{ id: 7, y: -100, x: 100 },
	{ id: 8, y: 0, x: 300 }
].map((d) => ({ ...d, highlight: true, color: Color.Red } as Vertex));

function edgesTouchingVertex(vertex: Vertex, edges: Edge[]): Edge[] {
	return edges.filter(
		(e) =>
			e.source == vertex.id || e.source == vertex || e.target == vertex.id || e.target == vertex
	);
}

const highlightEdge = (edge: Edge) => {
	edge.highlight = true;
	edge.color = Color.Red;
};

export function highlightMstEdges(vertices: Vertex[], edges: Edge[]) {
	// A very naive and not optimized implementation of Prim's algorithm.

	const visited: Vertex[] = [];
	let queue: Edge[] = edgesTouchingVertex(vertices[0], edges);

	while (queue.length) {
		const minCost = Math.min(...queue.map((e) => (e?.label as number | undefined) ?? Infinity));
		const minEdge = queue.find((e) => e.label == minCost) as Edge;

		if (!visited.includes(minEdge?.source as Vertex)) {
			highlightEdge(minEdge);
			visited.push(minEdge?.source as Vertex);
			queue = queue.concat(...edgesTouchingVertex(minEdge?.source as Vertex, edges));
		}

		if (!visited.includes(minEdge?.target as Vertex)) {
			highlightEdge(minEdge);
			visited.push(minEdge?.target as Vertex);
			queue = queue.concat(...edgesTouchingVertex(minEdge?.target as Vertex, edges));
		}

		queue = queue.filter((e) => e != minEdge);
	}
}

highlightMstEdges(vertices, edges);
