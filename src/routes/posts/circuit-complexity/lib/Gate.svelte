<script lang="ts">
	export let name: string = '';
	export let description: string = '';
	export let highlight: boolean = false;
	export let focus: boolean = false;
</script>

<button
	class:highlight
	class:focus
	on:mouseenter={() => (focus = true)}
	on:mouseleave={() => (focus = false)}
	class="w-20 h-20 transition-all p-2 rounded-md shadow dark:shadow-none
	border border-zinc-600 dark:border-zinc-400 text-center
	flex flex-col items-center justify-center gap-1"
>
	<div class="text-sm">{name}</div>
	{#if description}
		<div class="px-2 text-xs italic text-center">{description}</div>
	{/if}
</button>

<style lang="postcss">
	button.highlight {
		@apply border-red-500  border-2;
	}

	button.focus {
		@apply scale-105 shadow-md;
	}
</style>
