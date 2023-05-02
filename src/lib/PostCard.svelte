<script lang="ts">
	import type { Post } from '$lib/interfaces/post';
	import moment from 'moment';
	export let post: Post;
</script>

<div
	class="relative shadow-sm border py-4 px-6 rounded-lg select-none
        hover:scale-[1.0125] transition-transform
        border-zinc-300 dark:border-zinc-700
		bg-zinc-50 dark:bg-zinc-800
		"
>
	<div class="font-bold text-2xl text-zinc-800 dark:text-zinc-200">
		{post.title}
	</div>

	<div class="leading-5">
		{post.subtitle}
	</div>

	<div class="font-light text-sm opacity-70 mt-1">
		{moment(post.published).format('MMM Do YYYY')}
		{#each post.tags as tag}
			<span class="before:content-['·'] before:mx-1">{tag}</span>
		{/each}
	</div>

	<!-- svelte-ignore a11y-missing-content -->
	<a href={post.url} class="absolute left-0 right-0 top-0 bottom-0" />
</div>
