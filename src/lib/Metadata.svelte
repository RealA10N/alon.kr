<script lang="ts">
	import { page } from '$app/stores';

	export let title: string | null = null;
	export let description: string | null = null;
	export let thumbnail: string | null = null;

	let pagetitle = title ? `${title} - Alon Krymgand` : 'Alon Krymgand';
</script>

<svelte:head>
	<meta name="robots" content="index, follow" />
	<meta property="og:site_name" content="Alon Krymgand" />
	<meta property="og:type" content="website" />

	<title>{pagetitle}</title>
	<meta property="og:title" content={pagetitle} />
	<meta name="twitter:title" content={pagetitle} />

	<link rel="canonical" href={$page.url.href} />
	<meta property="og:url" content={$page.url.href} />

	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
		<meta name="twitter:description" content={description} />
	{/if}

	{#if thumbnail}
		<meta property="og:image" content={thumbnail} />
		<meta name="twitter:image" content={thumbnail} />
		<meta property="og:image:type" content="image/png" />
		<meta name="twitter:card" content="summary_large_image" />
	{:else}
		<meta name="twitter:card" content="summary" />
	{/if}
</svelte:head>
