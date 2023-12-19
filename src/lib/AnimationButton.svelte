<script lang="ts">
	import { onMount } from 'svelte';

	export let playOnMount: boolean = true;
	export let interval: number = 2000;

	let timeout: ReturnType<typeof setTimeout> | undefined;

	export const play = () => (next(), (timeout = setTimeout(play, interval)));
	export const stop = () => (clearTimeout(timeout), (timeout = undefined));

	export let next: () => void;

	export const toggle = () => {
		timeout === undefined ? play() : stop();
	};

	if (playOnMount) onMount(play);
</script>

<button on:click={toggle}>{timeout === undefined ? 'Play' : 'Pause'}</button>
