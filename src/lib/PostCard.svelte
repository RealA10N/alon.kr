<script lang="ts">
	import type { Post } from '$lib/interfaces/post';
	import moment from 'moment';
	export let post: Post;
</script>

<div
	class="relative border p-6 my-4 rounded-lg select-none
		shadow-sm hover:shadow-md hover:scale-[1.0125] transition-all
        border-zinc-300 dark:border-zinc-700
		bg-zinc-50 dark:bg-zinc-800"
>
	<div class="font-bold text-xl sm:text-2xl text-zinc-800 dark:text-zinc-200">
		{post.title}
		<span class="invisible absolute sm:visible sm:relative font-light text-sm opacity-70 mt-1">
			{moment(post.published).format('MMM Do YYYY')}
		</span>
	</div>

	<div class="leading-5 text-base sm:text-lg">
		{post.subtitle}
	</div>

	<!-- svelte-ignore a11y-missing-content -->
	<a href={post.url} class="absolute left-0 right-0 top-0 bottom-0" />
</div>
