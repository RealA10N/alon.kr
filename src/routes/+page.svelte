<script lang="ts">
	import PostCard from '$src/lib/PostCard.svelte';

	export let data;
</script>

<h1>Alon Krymgand</h1>
<i>/* TODO: build website */</i>

{#each data.posts as post}
	<PostCard {post} />
{/each}
