<script lang="ts">
	export let title: string;
	export let description: string | undefined = undefined;
	export let tags: string[] | undefined = undefined;
</script>

<header class="flex flex-col items-center mb-4 text-zinc-700 dark:text-zinc-300">
	<h1 class="text-center mt-0">{title}</h1>
	{#if description}
		<div class="font-medium tracking-wider text-md italic text-center">
			{description}
		</div>
	{/if}

	{#if tags && tags.length > 0}
		<ul class="flex flex-wrap justify-center mt-1 gap-2">
			{#each tags as tag}
				<li class="tag m-0">{tag}</li>
			{/each}
		</ul>
	{/if}
</header>
