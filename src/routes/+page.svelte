<script lang="ts" context="module">
	export const description = `My name is Alon Krymgand. This is my site. I write about stuff that I find interesting, and I hope you find it interesting too! I also run.`;
</script>

<script lang="ts">
	import Metadata from '$lib/Metadata.svelte';
	import PostCard from '$lib/PostCard.svelte';
	import { toTaglist } from '$src/lib/interfaces/post.js';
	export let data;
</script>

<svelte:head>
	<link
		rel="alternate"
		type="application/rss+xml"
		title="Alon Krymgand"
		href="https://alon.kr/rss.xml"
	/>
</svelte:head>

<Metadata {description} />

<h1>...Hello World! 👋</h1>
<!-- Same text as the description, which stays plain for metadata and RSS -->
<p>
	My name is Alon Krymgand. This is my site. I write about stuff that I find interesting, and I hope
	you find it interesting too! I also <a href="/running">run</a>.
</p>

{#each data.posts as post}
	<PostCard
		title={post.title}
		description={post.description}
		tags={toTaglist(post)}
		href={post.url}
	/>
{/each}
