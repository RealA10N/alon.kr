<script lang="ts">
	import Circuit from '$lib/graphs/Circuit.svelte';
	import Figure from '$lib/Figure.svelte';
	import { type Edge } from '$lib/graphs/Graph.svelte';
	import StepAnimation from '$lib/StepAnimation.svelte';

	import { type Gate, NewInputGate, NewNandGate, NewOutputGate } from '$lib/graphs/Circuit.svelte';
	import { onMount } from 'svelte';

	let inputs = [] as boolean[];
	const getInputs = () => inputs;

	let vertices = [] as Gate[];
	let edges = [] as Edge[];

	let refresh = () => {};

	const showAnd = () => {
		inputs = [false, false];

		vertices = [
			{ id: 1, ...NewInputGate(getInputs, 0), x: -150, y: -75 },
			{ id: 2, ...NewInputGate(getInputs, 1), x: -150, y: 75 },
			{ id: 3, ...NewNandGate(), x: -50, y: 0 },
			{ id: 4, ...NewNandGate(), x: 50, y: 0 },
			{ id: 5, ...NewOutputGate(0), x: 150, y: 0 }
		] as Gate[];

		edges = [
			{ source: 1, target: 3 },
			{ source: 2, target: 3 },
			{ source: 3, target: 4, curve: 30 },
			{ source: 3, target: 4, curve: -30 },
			{ source: 4, target: 5 }
		].map((e) => ({ ...e, direction: true } as Edge));

		refresh();
	};

	const showOr = () => {
		inputs = [false, false];

		vertices = [
			{ id: 1, ...NewInputGate(getInputs, 0), x: -150, y: -100 },
			{ id: 2, ...NewInputGate(getInputs, 1), x: -150, y: 100 },
			{ id: 3, ...NewNandGate(), x: -50, y: -100 },
			{ id: 4, ...NewNandGate(), x: -50, y: 100 },
			{ id: 5, ...NewNandGate(), x: 50, y: 0 },
			{ id: 6, ...NewOutputGate(0), x: 150, y: 0 }
		] as Gate[];
		edges = [
			{ source: 1, target: 3, curve: 30 },
			{ source: 1, target: 3, curve: -30 },
			{ source: 2, target: 4, curve: 30 },
			{ source: 2, target: 4, curve: -30 },
			{ source: 3, target: 5 },
			{ source: 4, target: 5 },
			{ source: 5, target: 6 }
		].map((e) => ({ ...e, direction: true } as Edge));

		refresh();
	};

	const showNot = () => {
		inputs = [false];

		vertices = [
			{ id: 1, ...NewInputGate(getInputs, 0), x: -100, y: 0 },
			{ id: 2, ...NewNandGate(), x: 0, y: 0 },
			{ id: 3, ...NewOutputGate(0), x: 100, y: 0 }
		] as Gate[];

		edges = [
			{ source: 1, target: 2, curve: 30 },
			{ source: 1, target: 2, curve: -30 },
			{ source: 2, target: 3 }
		].map((e) => ({ ...e, direction: true } as Edge));

		refresh();
	};

	const steps = [
		{ name: 'And Reduction', func: showAnd },
		{ name: 'Or Reduction', func: showOr },
		{ name: 'Not Reduction', func: showNot }
	];

	onMount(showAnd);
</script>

<Figure>
	<Circuit height={260} slot="content" bind:vertices bind:edges bind:inputs bind:refresh />
	<StepAnimation
		{steps}
		current={0}
		showAnimationButton={false}
		playOnMount={false}
		slot="buttons"
	/>
	<svelte:fragment slot="caption">
		A reduction from the complete basis &#123;∧, ∨, ¬&#125; to &#123;↑&#125;
	</svelte:fragment>
</Figure>
