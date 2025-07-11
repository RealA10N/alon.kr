<script lang="ts">
	import { slide } from 'svelte/transition';

	let focus = false;
	const toggle = () => (focus = !focus);
</script>

<button on:click={toggle} class:focus title="Show footnote"> ... </button>

{#if focus}
	<hr class="" transition:slide />
	<div class="italic text-sm" transition:slide>
		<slot />
	</div>
{/if}
