<script lang="ts">
	import { navigating } from '$app/stores';

	function width() {
		return {
			duration: 500,
			css: (t: number) => `width: ${t * 100}%;`
		};
	}
</script>

{#if $navigating}
	<div in:width class="fixed left-0 top-0 w-full h-1 z-50 bg-zinc-400 dark:bg-zinc-100" />
{/if}
