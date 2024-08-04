<script lang="ts">
	import { browser } from '$app/environment';
	import Metadata from '$lib/Metadata.svelte';
	import Header from '$src/lib/Header.svelte';
	import { type Post, toTaglist } from '$src/lib/interfaces/post';
	export let post: Post;

	export const prerender = true;
</script>

<Metadata title={post.title} description={post.description} />

<Header title={post.title} description={post.description} tags={toTaglist(post, true)} />

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
