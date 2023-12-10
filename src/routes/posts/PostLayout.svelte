<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import moment from 'moment';

	import Metadata from '$lib/Metadata.svelte';

	export let title: string;
	export let description: string | undefined;
	export let published: number;
	export let length: number;
	export let tags: string[];

	onMount(() => {});
</script>

<Metadata {title} {description} />

<header class="mb-4">
	<h1>{title}</h1>
	<div class="font-medium text-zinc-700 dark:text-zinc-300 tracking-wider text-sm italic">
		{description}
	</div>
	<ul class="tags-list flex flex-wrap my-1">
		<li>
			{moment(published).format('MMM Do YYYY')}
		</li>
		<li>
			{length} min read
		</li>
		{#each tags as tag}
			<li>
				{tag}
			</li>
		{/each}
	</ul>
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
			data-mapping="specific"
			data-term={title}
			data-strict="1"
			data-reactions-enabled="1"
			data-emit-metadata="1"
			data-input-position="bottom"
			data-theme="preferred_color_scheme"
			data-lang="en"
			data-loading="lazy"
			crossorigin="anonymous"
			async
		></script>
	</div>
{/if}

<style lang="postcss">
	.tags-list li {
		@apply rounded-md px-2 mr-1 ml-0 my-1
		text-sm list-none
		text-zinc-700 dark:text-zinc-300
		border border-zinc-800 dark:border-zinc-200;
	}
</style>
