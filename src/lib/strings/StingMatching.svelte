<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { type StringMatchingState, StringCompare } from '$lib/interfaces/stringMatching';
	import LetterBox from '$lib/strings/LetterBox.svelte';
	import FullWidth from '$lib/FullWidth.svelte';

	export let state: StringMatchingState;

	const shift = tweened(0, {
		duration: 150,
		easing: cubicInOut
	});

	const comperingShift = tweened(0, {
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
			Math.min(state.pattern.length * 35, 300) * (state.comparing / state.pattern.length - 0.5);
		$comperingShift = state.comparing * pixelShift - skew;
	}

	const compareTextToPattern = (idx: number) =>
		state.pattern[idx] === state.text[idx + state.shift]
			? StringCompare.Matching
			: StringCompare.NotMatching;

	$: compareList = Array.from({ length: state.comparing }, (_, i) => compareTextToPattern(i));
	$: init = state.comparing === 0 && state.shift === 0;
</script>

<FullWidth>
	<div class="relative" style="right: calc(-50vw + {$comperingShift}px);">
		<span class:init class="-translate-x-14">Text</span>
		<div class="string" style="right: {$shift}px">
			{#each state.text as char, idx}
				<LetterBox
					{char}
					highlight={idx === state.highlight}
					mark={state.mark?.text?.includes(idx)}
				/>
			{/each}
		</div>

		<span class:init class="-translate-x-20">Pattern</span>
		<div class="string">
			{#each state.pattern as char, idx}
				<LetterBox
					{char}
					matching={compareList[idx]}
					highlight={idx + state.shift === state.highlight}
					mark={state.mark?.pattern?.includes(idx)}
				/>
			{/each}
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
