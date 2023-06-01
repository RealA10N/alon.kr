<script lang="ts">
	import '$src/app.css';
	import '@fontsource/zilla-slab';
	import Header from '$lib/Header.svelte';
	import LoadingBar from '$lib/LoadingBar.svelte';
</script>

<LoadingBar />

<Header />

<main class="max-w-3xl px-6 m-auto">
	<slot />
</main>
