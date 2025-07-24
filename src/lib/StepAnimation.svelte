<script lang="ts" context="module">
	export interface Step {
		name: string;
		func: () => void;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	export let steps: Step[];
	export let playOnMount: boolean = true;
	export let interval: number = 2000;
	export let showAnimationButton: boolean = true;

	export let current: number | undefined;
	let timeout: ReturnType<typeof setTimeout> | undefined;
	$: playing = timeout !== undefined;

	export const play = () => {
		if (timeout === undefined) current = 0;
		else current = (current! + 1) % steps.length;
		steps[current].func();
		timeout = setTimeout(play, interval);
	};

	export const stop = () => {
		clearTimeout(timeout);
		timeout = undefined;
		current = undefined;
	};

	export const toggle = () => {
		timeout === undefined ? play() : stop();
	};

	export const set = (stepIndex: number) => {
		stop();
		steps[stepIndex].func();
		current = stepIndex;
	};

	if (playOnMount) onMount(play);
</script>

{#if showAnimationButton}
	<button on:click={toggle}>{playing ? 'Stop' : 'Restart'} Animation</button>
{/if}
{#each steps as step, i}<button class:focus={current === i} on:click={() => set(i)}>
		{step.name}</button
	>{/each}
