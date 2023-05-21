<script lang="ts">
	import PostCard from '$src/lib/PostCard.svelte';

	export let data;
</script>

<h1 class="text-4xl sm:text-5xl">...Hello World! 👋</h1>
<p class="text-base sm:text-lg">
	My name is Alon Krymgnad. This is my site. I write about stuff that I find interesting, and I hope
	you find it interesting too!
</p>

{#each data.posts as post}
	<PostCard {post} />
{/each}
