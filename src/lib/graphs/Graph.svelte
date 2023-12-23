<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import type { Edge, Vertex } from '$lib/graphs/graphs';
	import { GraphMode } from '$lib/graphs/graphs';
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

	type runOnTickFunc = { (): any };
	export let runOnTick: runOnTickFunc | undefined = undefined;

	// A unique string representing an instance of the graph.
	// Since we are manipulating the svg (DOM) directly, svelte can't help
	// us with isolation between different instances of the component in the
	// same page. Where needed, we use this unique value to share state between
	// the same instance and to not mix different instances (for example, in
	// class names).
	const unique = Math.random().toString(16).substring(2);

	// When one of the props updates, we "reheat" the simulation.
	let simulation: d3.Simulation<Vertex, Edge> | undefined;
	$: $$props, initSimulation();

	// The svg tags is bounded to this variable.
	let graphNodes: SVGSVGElement, graphLinks: SVGSVGElement;

	function clamp(x: number, total: number) {
		// Ensures that x is in the range [-total/2, total/2].
		// Returns the closest endpoint of the range if the value if outside
		// of it.
		const lo = -total / 2 + padding;
		const hi = total / 2 - padding;
		return x < lo ? lo : x > hi ? hi : x;
	}

	function lineLength(link: Edge) {
		const dx = Math.abs(link.source.x - link.target.x);
		const dy = Math.abs(link.source.y - link.target.y);
		return Math.sqrt(dx * dx + dy * dy);
	}

	function boundsForce() {
		// A custom force that keeps all nodes inside the svg viewBox
		for (let d of vertices) {
			d.x = clamp(d.x ?? 0, width);
			d.y = clamp(d.y ?? 0, height);
		}
	}

	function endNodeSelection(event, d) {
		delete d.fx;
		delete d.fy;
		d3.select(this).classed('fixed', false);
		simulation?.alpha(1).restart();
	}

	function startNodeSelection() {
		d3.select(this).classed('fixed', true);
	}

	function dragNode(event, d) {
		d.fx = clamp(event.x, width);
		d.fy = clamp(event.y, height);
		simulation?.alpha(1).restart();
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
			.force('bounds', boundsForce)
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

				g.append('line').classed('line', true);

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
			.attr('x1', (d) => d.source.x)
			.attr('y1', (d) => d.source.y)
			.attr('x2', (d) => d.target.x)
			.attr('y2', (d) => d.target.y)
			.attr('marker-end', (d) => (d.direction ? `url(#arrow-${unique})` : ''));

		link
			.select('.label')
			.text((d) => d.label?.toString() ?? '')
			.attr('x', (d) => (d.source.x + d.target.x) / 2)
			.attr('y', (d) => (d.source.y + d.target.y) / 2)
			.attr(
				'dx',
				(d) =>
					`${((d.source.x <= d.target.x ? 1 : -1) * (d.target.y - d.source.y)) / lineLength(d)}em`
			)
			.attr(
				'dy',
				(d) =>
					`${((d.source.x <= d.target.x ? 1 : -1) * (d.source.x - d.target.x)) / lineLength(d)}em`
			);

		const node = d3
			.select(graphNodes)
			.selectAll('.node')
			.data(vertices)
			.join((enter) => {
				const g = enter
					.append('g')
					.classed('node', true)
					.classed('fixed', (d) => d.fx !== undefined);
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

<svg id="graph" {width} {height} viewBox="{-width / 2} {-height / 2} {width} {height}">
	<marker
		id="arrow-{unique}"
		class="graph-marker"
		viewBox="-15 -10 15 20"
		markerUnits="userSpaceOnUse"
		refX={radius}
		markerWidth={16}
		markerHeight={16}
		orient="auto"
	>
		<path d="M -15 -10 L 0 0 L -15 10" fill="currentColor" />
	</marker>

	<g id="links" bind:this={graphLinks} />
	<g id="nodes" bind:this={graphNodes} />
</svg>

<style lang="postcss">
	#nodes :global(.node) {
		/* nodes only */
		@apply cursor-pointer;
	}

	#links :global(.line),
	#nodes :global(.node) {
		/* regular appearance */
		@apply stroke-2 stroke-zinc-600 dark:stroke-zinc-400
			fill-zinc-100 dark:fill-zinc-900;
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
