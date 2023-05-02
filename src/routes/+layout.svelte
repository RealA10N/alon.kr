<script lang="ts">
	import '$src/app.css';
	import '@fontsource/zilla-slab';
	import Header from '$lib/Header.svelte';
</script>

<Header />

<main class="max-w-3xl px-12 m-auto">
	<slot />
</main>
