<script lang="ts">
	import PostCard from '$src/lib/PostCard.svelte';

	export let data;
</script>

<h1>...Hello World! 👋</h1>
My name is Alon Krymgnad. This is my site. I write about stuff that I find interesting, and I hope you
find it interesting too!

{#each data.posts as post}
	<PostCard {post} />
{/each}
