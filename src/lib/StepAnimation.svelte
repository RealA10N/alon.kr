<script lang="ts">
	import { onMount } from 'svelte';

	interface lambda {
		(): void;
	}

	export let steps: lambda[];
	export let playOnMount: boolean = true;
	export let interval: number = 2000;

	let current: number | undefined;
	let timeout: ReturnType<typeof setTimeout> | undefined;

	export const play = () => {
		if (current === undefined) current = 0;
		else current = (current + 1) % steps.length;
		steps[current]();
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

	if (playOnMount) onMount(play);
</script>

<button on:click={toggle}>{timeout === undefined ? 'Restart' : 'Stop'} Animation</button>
