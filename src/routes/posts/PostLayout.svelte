<script lang="ts">
	import { browser } from '$app/environment';
	import Metadata from '$lib/Metadata.svelte';
	import { type Post, toTaglist } from '$src/lib/interfaces/post';
	export let post: Post;

	export const prerender = true;
</script>

<Metadata title={post.title} description={post.description} />

<header class="mb-4 text-zinc-700 dark:text-zinc-300">
	<h1>{post.title}</h1>
	<div class="font-medium tracking-wider text-sm italic">
		{post.description}
	</div>
	<ul class="flex flex-wrap mt-1 gap-2">
		{#each toTaglist(post, true) as tag}<li class="tag m-0">{tag}</li>{/each}
	</ul>
</header>

<article class="text-justify">
	<slot />
</article>

{#if browser}
	<footer class="my-10">
		<script
			src="https://giscus.app/client.js"
			data-repo="reala10n/alon.kr"
			data-repo-id="R_kgDOJd7i1w"
			data-category="General"
			data-category-id="DIC_kwDOJd7i184CWSh5"
			data-mapping="specific"
			data-term={post.title}
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
	</footer>
{/if}
