<script lang="ts">
	import '$src/app.css';
	import '@fontsource/zilla-slab';
	import Title from '$src/lib/Title.svelte';
	import LoadingBar from '$lib/LoadingBar.svelte';
</script>

<LoadingBar />

<Title />

<main class="max-w-3xl px-6 m-auto">
	<slot />
</main>
