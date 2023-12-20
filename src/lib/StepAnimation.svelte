<script lang="ts">
	import { onMount } from 'svelte';

	interface Step {
		name: string;
		func: () => void;
	}

	export let steps: Step[];
	export let playOnMount: boolean = true;
	export let interval: number = 2000;

	let current: number | undefined;
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

<button on:click={toggle}>{playing ? 'Stop' : 'Restart'} Animation</button>
{#each steps as step, i}
	<button class:focus={current === i} on:click={() => set(i)}>
		{step.name}
	</button>
{/each}
