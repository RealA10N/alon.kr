<script lang="ts" context="module">
	import { type Edge } from './Graph.svelte';
	import { type Gate } from './Circuit.svelte';
	import { type Writable } from 'svelte/store';

	export type GraphDesc = {
		name: string;
		inputs: Writable<boolean[]>;
		vertices: Gate[];
		edges: Edge[];
	};
</script>

<script lang="ts">
	import Figure from '../Figure.svelte';
	import StepAnimation, { type Step } from '../StepAnimation.svelte';
	import Circuit from './Circuit.svelte';
	import { writable } from 'svelte/store';

	export const prerender = true;

	export let graphs: GraphDesc[] = [];
	$: steps = graphs.map((g) => ({ name: g.name, func: () => select(g) } as Step));

	let inputs = writable([] as boolean[]);
	let vertices: Gate[] = [];
	let edges: Edge[] = [];

	const select = (g: GraphDesc) => {
		vertices = g.vertices;
		edges = g.edges;
		inputs = g.inputs;
	};

	select(graphs[0]);
</script>

<Figure>
	<Circuit {...$$restProps} slot="content" bind:vertices bind:edges bind:inputs />
	<StepAnimation
		{steps}
		current={0}
		showAnimationButton={false}
		playOnMount={false}
		slot="buttons"
	/>
	<slot name="caption" />
</Figure>
