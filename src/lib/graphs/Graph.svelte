<script lang="ts" context="module">
	import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';

	export interface Edge extends SimulationLinkDatum<Vertex> {
		// includes 'source', 'target' from SimulationLinkDatum.
		color?: Color;
		label?: number | string;
		highlight?: boolean; // should the edge be bolder
		direction?: boolean; // is the edge directed?
		curve?: number; // curve distance in pixels (0 = straight, positive = clockwise curve, negative = counter-clockwise)
	}

	export interface Vertex extends SimulationNodeDatum {
		id: number;
		color?: Color;
		label?: string | number;
		highlight?: boolean;
	}

	export enum GraphMode {
		static,
		sticky,
		regular
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { Color } from '$lib/interfaces/color';

	export let width: number = 500;
	export let height: number = 350;

	export let radius = 12;
	$: diameter = 2 * radius;
	$: padding = diameter;

	export let vertexLabels: boolean = true;
	export let edgeLabels: boolean = true;
	export let mode: GraphMode = GraphMode.sticky;
	export let gravity: boolean = true;

	export let edges: Edge[];
	export let vertices: Vertex[];

	export let onInteraction = () => {};

	type runOnTickFunc = { (): any };
	export let runOnTick: runOnTickFunc | undefined = undefined;

	// A function that can be called to reheat the simulation.
	// This is useful when the graph is updated, for example, when
	// edges or vertices are added or removed.
	// No now forces are applied to the simulation: if the simulation is in a
	// stable state, no new movement will be applied to the nodes. If you want
	// to reset the forces, use `warmRefresh` instead.
	export const refresh = () => {
		simulation?.restart();
	};

	// A function that can be called to reheat the simulation, and reset all
	// forces applied to the nodes.
	export const warmRefresh = () => {
		simulation?.alpha(1).restart();
	};

	// When one of the props updates, we reinitialize the whole simulation.
	let simulation: d3.Simulation<Vertex, Edge> | undefined;
	$: $$props, initSimulation();

	// The svg tags is bounded to this variable.
	let graphNodes: SVGGElement, graphLinks: SVGGElement;

	// Ensures that x is in the range [-total/2, total/2].
	// Returns the closest endpoint of the range if the value if outside
	// of it.
	const viewboxClamp = (x: number, total: number) => {
		const lo = -total / 2 + padding;
		const hi = total / 2 - padding;
		return x < lo ? lo : x > hi ? hi : x;
	};

	function lineLength(link: Edge) {
		const dx = Math.abs(link.source.x - link.target.x);
		const dy = Math.abs(link.source.y - link.target.y);
		return Math.sqrt(dx * dx + dy * dy);
	}

	// Calculate the curved path for an edge
	function getCurvedPath(link: Edge): string {
		const x1 = link.source.x;
		const y1 = link.source.y;
		const x2 = link.target.x;
		const y2 = link.target.y;

		// If no curve specified, return straight line
		if (!link.curve || link.curve === 0) {
			return `M ${x1} ${y1} L ${x2} ${y2}`;
		}

		// Calculate the midpoint
		const midX = (x1 + x2) / 2;
		const midY = (y1 + y2) / 2;

		// Calculate the perpendicular vector
		const dx = x2 - x1;
		const dy = y2 - y1;
		const length = Math.sqrt(dx * dx + dy * dy);

		// Avoid division by zero for overlapping points
		if (length === 0) {
			return `M ${x1} ${y1} L ${x2} ${y2}`;
		}

		// Normalize the perpendicular vector
		const perpX = -dy / length;
		const perpY = dx / length;

		// Calculate control point using the curve distance directly
		const controlX = midX + perpX * link.curve;
		const controlY = midY + perpY * link.curve;

		// Return quadratic bezier curve
		return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
	}

	// Calculate the midpoint of a curved edge for label positioning
	function getCurvedMidpoint(link: Edge): { x: number; y: number } {
		const x1 = link.source.x;
		const y1 = link.source.y;
		const x2 = link.target.x;
		const y2 = link.target.y;

		// If no curve, return simple midpoint
		if (!link.curve || link.curve === 0) {
			return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
		}

		// Calculate the midpoint
		const midX = (x1 + x2) / 2;
		const midY = (y1 + y2) / 2;

		// Calculate the perpendicular vector
		const dx = x2 - x1;
		const dy = y2 - y1;
		const length = Math.sqrt(dx * dx + dy * dy);

		// Avoid division by zero
		if (length === 0) {
			return { x: midX, y: midY };
		}

		// Normalize the perpendicular vector
		const perpX = -dy / length;
		const perpY = dx / length;

		// Calculate control point using the curve distance directly
		const controlX = midX + perpX * link.curve;
		const controlY = midY + perpY * link.curve;

		// For quadratic bezier, the point at t=0.5 is:
		// B(0.5) = 0.25*P0 + 0.5*P1 + 0.25*P2
		const labelX = 0.25 * x1 + 0.5 * controlX + 0.25 * x2;
		const labelY = 0.25 * y1 + 0.5 * controlY + 0.25 * y2;

		return { x: labelX, y: labelY };
	}

	const viewboxClampVertex = (d: Vertex) => {
		d.x = viewboxClamp(d.x ?? 0, width);
		d.y = viewboxClamp(d.y ?? 0, height);

		if (d.fx) d.fx = viewboxClamp(d.fx, width);
		if (d.fy) d.fy = viewboxClamp(d.fy, height);
	};

	// A custom force that keeps all nodes inside the svg viewBox
	const viewboxBoundsForce = () => {
		for (let v of vertices) viewboxClampVertex(v);
	};

	function endNodeSelection(event, d) {
		delete d.fx;
		delete d.fy;
		d3.select(this).classed('fixed', false);
		warmRefresh();
	}

	function startNodeSelection() {
		onInteraction();
		d3.select(this).classed('fixed', true);
	}

	function dragNode(event, d) {
		d.fx = viewboxClamp(event.x, width);
		d.fy = viewboxClamp(event.y, height);
		warmRefresh();
	}

	function initRegularDrag(node) {
		const drag = d3
			.drag()
			.on('start', startNodeSelection)
			.on('drag', dragNode)
			.on('end', endNodeSelection);
		node.call(drag);
	}

	function initStickyDrag(node) {
		const drag = d3.drag().on('start', startNodeSelection).on('drag', dragNode);
		node.call(drag).on('click', endNodeSelection);
	}

	function initSimulation() {
		simulation = d3
			.forceSimulation<Vertex, Edge>()
			.nodes(vertices)
			.force('center', d3.forceCenter())
			.force('collide', d3.forceCollide(3 * radius))
			.force('viewboxBounds', viewboxBoundsForce)
			.on('tick', tick);

		if (gravity)
			simulation.force('charge', d3.forceManyBody().strength(-80)).force(
				'link',
				d3
					.forceLink<Vertex, Edge>(edges)
					.distance(radius * 10)
					.id((d) => d.id)
			);
	}

	onMount(initSimulation);

	function updateColorClass(this: any, d: { color?: Color }): void {
		this.classList.remove(...Object.values(Color));
		this.classList.add(d.color);
	}

	function tick() {
		runOnTick?.();

		const link = d3
			.select(graphLinks)
			.selectAll('.link')
			.data(edges)
			.join((enter) => {
				const g = enter.append('g').classed('link', true);

				g.append('path').classed('line', true);

				if (edgeLabels)
					g.filter((d) => Boolean(d.label))
						.append('text')
						.classed('label', true)
						.attr('text-anchor', 'middle') // horizontal alignment
						.attr('dominant-baseline', 'middle'); // vertical alignment

				return g;
			})
			.classed('highlight', (e) => e.highlight ?? false)
			.each(updateColorClass);

		link
			.select('.line')
			.attr('d', getCurvedPath)
			.attr('marker-end', (d) => (d.direction ? 'url(#graph-arrow-head)' : ''));

		link
			.select('.label')
			.text((d) => d.label?.toString() ?? '')
			.attr('x', (d) => getCurvedMidpoint(d).x)
			.attr('y', (d) => getCurvedMidpoint(d).y);

		const node = d3
			.select(graphNodes)
			.selectAll('.node')
			.data(vertices)
			.join((enter) => {
				const g = enter
					.append('g')
					.classed('node', true)
					.classed('clickable', mode !== GraphMode.static)
					.classed('fixed', (d) => d.fx !== undefined || d.fy !== undefined);
				g.append('circle').attr('r', radius);

				if (vertexLabels)
					g.append('text')
						.text((d) => d.label ?? '')
						.classed('label', true)
						.attr('text-anchor', 'middle') // horizontal alignment
						.attr('dominant-baseline', 'middle'); // vertical alignment
				return g;
			});

		node
			.attr('transform', (d) => `translate(${d.x}, ${d.y})`)
			.classed('highlight', (v) => v.highlight ?? false)
			.each(updateColorClass);

		node.select('label').text((v) => v.label ?? '');

		if (mode == GraphMode.sticky) initStickyDrag(node);
		if (mode == GraphMode.regular) initRegularDrag(node);
	}
</script>

<svg
	{...$$restProps}
	id="graph"
	{width}
	{height}
	viewBox="{-width / 2} {-height / 2} {width} {height}"
>
	<defs>
		<marker
			id="graph-arrow-head"
			markerWidth="10"
			markerHeight="10"
			refX={10 + radius}
			refY="5"
			orient="auto"
			markerUnits="userSpaceOnUse"
		>
			<polygon points="0 0, 10 5, 0 10" fill="context-stroke" />
		</marker>
	</defs>

	<g id="links" bind:this={graphLinks} />
	<g id="nodes" bind:this={graphNodes} />
</svg>

<style lang="postcss">
	#nodes :global(.clickable) {
		@apply cursor-pointer;
	}

	#links :global(.line),
	#nodes :global(.node) {
		/* regular appearance */
		@apply stroke-2 stroke-zinc-600 dark:stroke-zinc-400
			fill-zinc-100 dark:fill-zinc-900;
	}

	#links :global(.line) {
		/* path-specific styles: do not fill the space between curved lines */
		@apply fill-none;
	}

	#nodes :global(.highlight),
	#links :global(.highlight .line) {
		/* highlight appearance */
		@apply stroke-[5px];
	}

	#nodes :global(.node.fixed) {
		/* fixed node appearance */
		@apply fill-zinc-300 dark:fill-zinc-700;
	}

	#graph :global(.label) {
		/* all labels */
		@apply font-black !stroke-none fill-zinc-600 dark:fill-zinc-400;
	}

	#nodes :global(.label) {
		/* node labels only */
		@apply text-sm;
	}

	#nodes :global(.red),
	#links :global(.red .line) {
		@apply !stroke-red-500;
	}

	#graph :global(.red .label) {
		@apply !fill-red-500;
	}

	#nodes :global(.blue),
	#links :global(.blue .line) {
		@apply !stroke-blue-500;
	}

	#graph :global(.blue .label) {
		@apply !fill-blue-500;
	}

	#nodes :global(.green),
	#links :global(.green .line) {
		@apply !stroke-green-500;
	}

	#graph :global(.green .label) {
		@apply !fill-green-500;
	}

	#nodes :global(.yellow),
	#links :global(.yellow .line) {
		@apply !stroke-yellow-500;
	}

	#graph :global(.yellow .label) {
		@apply !fill-yellow-500;
	}
</style>
