<script lang="ts">
	import PostCard from '$src/lib/PostCard.svelte';

	export let data;
</script>

<h1>Golang Module Repository</h1>
<p>
	A catalog of all the open-source go modules & projects I maintain under the <i>alon.kr</i> domain.
</p>

{#each data.packages as pkg}
	<PostCard
		title={pkg.title}
		description={pkg.description}
		tags={pkg.tags}
		href={pkg.relativeUrl}
	/>
{/each}
