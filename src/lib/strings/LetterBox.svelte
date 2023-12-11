<script lang="ts">
	import type { LetterState } from '$lib/interfaces/stringMatching';
	export let state: LetterState;
</script>

<div
	style="width: 40px; height: 40px;"
	class:highlight={state.highlight}
	class="inline-flex justify-center items-center
			border-2 text-center align-text-bottom m-[2px]
			shadow-sm rounded-md transition-all {state.mode}
			border-zinc-300 dark:border-zinc-700
			text-zinc-800 dark:text-zinc-200"
>
	<span class="text-center">{state.text}</span>
</div>

<style lang="postcss">
	.matching {
		@apply border-green-400 bg-green-200 dark:border-green-600 dark:bg-green-800;
	}

	.not-matching {
		@apply border-red-400 bg-red-200 dark:border-red-600 dark:bg-red-800;
	}

	.highlight {
		@apply scale-[1.15] shadow-md mx-2 font-bold
		text-zinc-600 dark:text-zinc-200
		!border-zinc-600 dark:!border-zinc-200;
	}

	.marked {
		@apply border-yellow-400 bg-yellow-200 dark:border-yellow-600 dark:bg-yellow-800;
	}
</style>
