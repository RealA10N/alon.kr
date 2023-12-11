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

	$: $shift = state.shift * (40 + 4); // 40px width+ 4px margin

	const compareTextToPattern = (idx: number) =>
		state.pattern[idx] === state.text[idx + state.shift]
			? StringCompare.Matching
			: StringCompare.NotMatching;

	$: compareList = Array.from({ length: state.comparing }, (_, i) => compareTextToPattern(i));

	let patternWidth: number;
</script>

<FullWidth>
	<div class="relative" style="right: calc(-50vw + {patternWidth / 2}px);">
		<div class="relative whitespace-nowrap my-2 w-fit" style="right: {$shift}px">
			{#each state.text as char, idx}
				<LetterBox {char} highlight={idx === state.highlight} />
			{/each}
		</div>

		<div class="my-2 w-fit" bind:clientWidth={patternWidth}>
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
