<script lang="ts">
	import { onMount } from 'svelte';

	export let playOnMount: boolean = true;
	export let interval: number = 2000;

	// returns the number of ms to wait before executing next step
	// this will override the default interval duration.
	export let next: () => number | void;

	let timeout: ReturnType<typeof setTimeout> | undefined;

	export const play = () => (timeout = setTimeout(play, next() ?? interval));
	export const stop = () => (clearTimeout(timeout), (timeout = undefined));

	export const toggle = () => {
		timeout === undefined ? play() : stop();
	};

	if (playOnMount) onMount(play);
</script>

<button on:click={toggle}>{timeout === undefined ? 'Play' : 'Pause'}</button>
