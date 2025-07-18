<script lang="ts">
	import { slide } from 'svelte/transition';

	let focus = false;
	const toggle = () => (focus = !focus);
</script>

<button
	on:click={toggle}
	class:focus
	class="rounded-full border-zinc-600 dark:border-zinc-400"
	title="Show footnote"
>
	<div class="-translate-y-1">...</div>
</button>

{#if focus}
	<hr class="" transition:slide />
	<div class="italic text-sm" {...$$restProps} style="text-align-last: center;" transition:slide>
		<slot />
	</div>
	<hr class="" transition:slide />
{/if}
