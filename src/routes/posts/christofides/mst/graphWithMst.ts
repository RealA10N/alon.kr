import type { Edge, Vertex } from '$src/lib/graphs/graphs';

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
	{ id: 1, highlight: true, y: 0, x: 200 },
	{ id: 2, highlight: true, y: 0, x: 0 },
	{ id: 3, highlight: true, y: 100, x: -100 },
	{ id: 4, highlight: true, y: 0, x: -100 },
	{ id: 5, highlight: true, y: 0, x: -200 },
	{ id: 6, highlight: true, y: -150, x: 0 },
	{ id: 7, highlight: true, y: -100, x: 100 },
	{ id: 8, highlight: true, y: 0, x: 300 }
];

function edgesTouchingVertex(vertex: Vertex, edges: Edge[]): Edge[] {
	return edges.filter(
		(e) =>
			e.source == vertex.id || e.source == vertex || e.target == vertex.id || e.target == vertex
	);
}

export function highlightMstEdges(vertices: Vertex[], edges: Edge[]) {
	// A very naive and not optimized implementation of Prim's algorithm.

	const visited: Vertex[] = [];
	let queue: Edge[] = edgesTouchingVertex(vertices[0], edges);

	while (queue.length) {
		const minCost = Math.min(...queue.map((e) => (e?.label as number | undefined) ?? Infinity));
		const minEdge = queue.find((e) => e.label == minCost) as Edge;

		if (!visited.includes(minEdge?.source as Vertex)) {
			minEdge.highlight = true;
			visited.push(minEdge?.source as Vertex);
			queue = queue.concat(...edgesTouchingVertex(minEdge?.source as Vertex, edges));
		}

		if (!visited.includes(minEdge?.target as Vertex)) {
			minEdge.highlight = true;
			visited.push(minEdge?.target as Vertex);
			queue = queue.concat(...edgesTouchingVertex(minEdge?.target as Vertex, edges));
		}

		queue = queue.filter((e) => e != minEdge);
	}
}

highlightMstEdges(vertices, edges);
