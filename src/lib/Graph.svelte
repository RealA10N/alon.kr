<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import type { Edge, Vertex } from '$lib/interfaces/graph';

	export let width: number = 500;
	export let height: number = 400;

	export let radius = 12;
	let padding = radius + 5;

	export let edges: Edge[];
	export let vertices: Vertex[];

	// When one of the props updates, we "reheat" the simulation.
	let simulation: d3.Simulation<Vertex, Edge> | undefined;
	$: $$props, simulation?.alpha(1)?.restart();

	// The svg tag is bounded to this variable.
	let svg: SVGSVGElement;

	function clamp(x: number, total: number) {
		// Ensures that x is in the range [-total/2, total/2].
		// Returns the closest endpoint of the range if the value if outside
		// of it.
		const lo = -total / 2 + padding;
		const hi = total / 2 - padding;
		return x < lo ? lo : x > hi ? hi : x;
	}

	function boundsForce() {
		// A custom force that keeps all nodes inside the svg viewBox
		for (let d of vertices) {
			d.x = clamp(d.x ?? 0, width);
			d.y = clamp(d.y ?? 0, height);
		}
	}

	onMount(() => {
		const linkGroup = d3
			.select(svg)
			.selectAll('.graph-link')
			.data(edges)
			.join('g')
			.classed('graph-link', true)
			.classed('graph-highlight', (e) => e.highlight ?? false);

		const linkLine = linkGroup.append('line');

		const linkText = linkGroup
			.filter((d) => Boolean(d.weight))
			.append('text')
			.classed('graph-label', true)
			.text((d) => d.weight?.toString() ?? '');

		const node = d3
			.select(svg)
			.selectAll('.graph-node')
			.data(vertices)
			.join('g')
			.classed('graph-node', true)
			.classed('graph-node-fixed', (d) => d.fx !== undefined)
			.classed('graph-highlight', (v) => v.highlight ?? false);

		node.append('circle').attr('r', radius);

		const tick = () => {
			linkLine
				?.attr('x1', (d) => d.source.x)
				?.attr('y1', (d) => d.source.y)
				?.attr('x2', (d) => d.target.x)
				?.attr('y2', (d) => d.target.y);
			node?.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

			linkText
				?.attr('x', (d) => (d.source.x + d.target.x) / 2)
				?.attr('y', (d) => (d.source.y + d.target.y) / 2)
				?.attr('dx', (d) =>
					Math.abs(d.source.x - d.target.x) < Math.abs(d.source.y - d.target.y) ? '.35em' : '0'
				)
				?.attr('dy', (d) =>
					Math.abs(d.source.y - d.target.y) < Math.abs(d.source.x - d.target.x) ? '-.35em' : '0'
				);
		};

		simulation = d3
			.forceSimulation<Vertex, Edge>()
			.nodes(vertices)
			.force('charge', d3.forceManyBody().strength(-80))
			.force('center', d3.forceCenter())
			.force(
				'link',
				d3
					.forceLink<Vertex, Edge>(edges)
					.distance((d) => (d.weight ? 60 : 30))
					.id((d) => d.id)
			)
			.force('bounds', boundsForce)
			.on('tick', tick);

		function dragstart() {
			d3.select(this).classed('graph-node-fixed', true);
		}

		function dragged(event, d) {
			d.fx = clamp(event.x, width);
			d.fy = clamp(event.y, height);
			simulation?.alpha(1).restart();
		}

		const drag = d3.drag().on('start', dragstart).on('drag', dragged);

		function click(event, d) {
			delete d.fx;
			delete d.fy;
			d3.select(this).classed('graph-node-fixed', false);
			simulation?.alpha(1).restart();
		}

		node.call(drag).on('click', click);
	});
</script>

<svg bind:this={svg} {width} {height} viewBox="{-width / 2} {-height / 2} {width} {height}" />
