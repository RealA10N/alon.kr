<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import type { StringMatchingState } from '$lib/interfaces/stringMatching';
	import LetterBox from '$lib/strings/LetterBox.svelte';
	import FullWidth from '$lib/FullWidth.svelte';

	export let state: StringMatchingState;

	const shift = tweened(0, {
		duration: 150,
		easing: cubicInOut
	});

	const focusShift = tweened(0, {
		duration: 150,
		easing: cubicInOut
	});

	const pixelShift = 40 + 4; // 40px width+ 4px margin

	$: {
		$shift = state.shift * pixelShift;
		// if the screen is big, and the pattern string is large,
		// we add a skew to fill the screen, otherwise it looks weird,
		// especially at the start since half of the screen is empty.
		const skew =
			Math.min(state.pattern.length * 35, 300) * (state.focus / state.pattern.length - 0.5);
		$focusShift = state.focus * pixelShift - skew;
	}

	$: init = state.shift === 0 && state.focus === -1;
</script>

<FullWidth>
	<div class="relative" style="right: calc(-50vw + {$focusShift}px);">
		<span class:init class="-translate-x-14">Text</span>
		<div class="string" style="right: {$shift}px">
			{#each state.text as ltr} <LetterBox state={ltr} />{/each}
		</div>

		<span class:init class="-translate-x-20">Pattern</span>
		<div class="string">
			{#each state.pattern as ltr}<LetterBox state={ltr} />{/each}
		</div>
	</div>
</FullWidth>

<style lang="postcss">
	span {
		@apply invisible sm:visible 
			transition-opacity opacity-0 absolute left-0 py-2;
	}
	.init {
		@apply opacity-75 duration-1000 delay-1000;
	}

	.string {
		@apply relative whitespace-nowrap my-2 w-fit;
	}
</style>
