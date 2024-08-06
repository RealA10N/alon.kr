<script lang="ts">
	import Metadata from '$lib/Metadata.svelte';
	import PostCard from '$lib/PostCard.svelte';
	import { toTaglist } from '$src/lib/interfaces/post.js';
	export let data;

	let description = `My name is Alon Krymgand. This is my site. I write about stuff that I find interesting, and I hope you find it interesting too!`;
</script>

<Metadata {description} />

<h1>...Hello World! 👋</h1>
<p>{description}</p>

{#each data.posts as post}
	<PostCard
		title={post.title}
		description={post.description}
		tags={toTaglist(post)}
		url={post.url}
	/>
{/each}
