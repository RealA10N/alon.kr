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
	$: $shift = state.shift * pixelShift;
	$: $comperingShift = state.comparing * pixelShift;

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
		<div class="relative whitespace-nowrap my-2 w-fit" style="right: {$shift}px">
			{#each state.text as char, idx}
				<LetterBox {char} highlight={idx === state.highlight} />
			{/each}
		</div>

		<span class:init class="-translate-x-20">Pattern</span>
		<div class="my-2 w-fit">
			{#each state.pattern as char, idx}
				<LetterBox
					{char}
					matching={compareList[idx]}
					highlight={idx + state.shift === state.highlight}
				/>
			{/each}
		</div>
	</div>
</FullWidth>

<style lang="postcss">
	span {
		@apply transition-opacity opacity-0 absolute left-0 py-2;
	}
	.init {
		@apply opacity-75 duration-1000 delay-1000;
	}
</style>
