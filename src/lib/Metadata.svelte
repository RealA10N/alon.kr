<script lang="ts">
	export let title: string | null = null;
	export let description: string | null = null;
	export let thumbnail: string | null = null;

	let pagetitle = title ? `${title} - Alon Krymgand` : 'Alon Krymgand';
</script>

<svelte:head>
	<meta name="robots" content="index, follow" />
	<meta property="og:site_name" content="Alon Krymgand" />

	<title>{pagetitle}</title>
	<meta property="og:title" content={pagetitle} />

	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}

	{#if thumbnail}
		<meta property="og:image" content={thumbnail} />
		<meta name="twitter:image" content={thumbnail} />
		<meta property="og:image:type" content="image/png" />
		<meta name="twitter:card" content="summary_large_image" />
	{/if}
</svelte:head>
