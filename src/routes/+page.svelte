<script lang="ts">
	import Metadata from '$src/lib/Metadata.svelte';
	import PostCard from '$src/lib/PostCard.svelte';
	export let data;

	let description = `My name is Alon Krymgnad. This is my site. I write about stuff that I find interesting, and I hope you find it interesting too!`;
</script>

<Metadata {description} />

<h1 class="text-4xl sm:text-5xl">...Hello World! 👋</h1>
<p class="text-base sm:text-lg">{description}</p>

{#each data.posts as post}
	<PostCard {post} />
{/each}
