<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	/** @type {string} */
	export let title;

	/** @type {string | undefined} */
	export let subtitle;

	onMount(() => {});
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<header class="mb-4">
	<h1>
		{title}
	</h1>
	{#if subtitle}
		<div class="font-medium tracking-wider text-sm italic">{subtitle}</div>
	{/if}
</header>

<div class="text-justify">
	<slot />
</div>

{#if browser}
	<div class="my-10">
		<script
			src="https://giscus.app/client.js"
			data-repo="reala10n/alon.kr"
			data-repo-id="R_kgDOJd7i1w"
			data-category="General"
			data-category-id="DIC_kwDOJd7i184CWSh5"
			data-mapping="title"
			data-strict="1"
			data-reactions-enabled="1"
			data-emit-metadata="0"
			data-input-position="bottom"
			data-theme="preferred_color_scheme"
			data-lang="en"
			data-loading="lazy"
			crossorigin="anonymous"
			async
		>
		</script>
	</div>
{/if}
