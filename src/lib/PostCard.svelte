<script lang="ts">
	export let title: string;
	export let description: string | undefined = undefined;
	export let tags: string[] | undefined = undefined;
	export let href: string | undefined = undefined;
</script>

<div
	class="relative border p-6 my-4 rounded-lg select-none
		shadow-sm hover:shadow-md hover:scale-[1.0125] transition-all
        border-zinc-300 dark:border-zinc-700
		bg-zinc-50 dark:bg-zinc-800"
>
	<div class="font-bold text-xl sm:text-2xl text-zinc-800 dark:text-zinc-200">
		{title}
	</div>

	<div class="leading-5 text-base sm:text-lg">
		{#if description}
			<span class="mr-3">{description}</span>
		{/if}
		{#if tags && tags.length > 0}
			<ul class="flex-wrap m-0 inline-flex gap-2 mt-1">
				{#each tags as tag}
					<li class="tag m-0 opacity-70">{tag}</li>
				{/each}
			</ul>
		{/if}
	</div>

	{#if href}
		<!-- svelte-ignore a11y-missing-content -->
		<a {href} class="absolute left-0 right-0 top-0 bottom-0" />
	{/if}
</div>
