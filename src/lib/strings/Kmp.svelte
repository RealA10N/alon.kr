<script lang="ts">
	import StingMatching from '$lib/strings/StingMatching.svelte';
	import type { StringMatchingState, BoxState } from '$lib/interfaces/strings';
	import { calcpi } from '$lib/strings/kmp';
	import StepAnimationUnbounded from '$lib/AnimationButton.svelte';
	import FullConfetti from '$lib/FullConfetti.svelte';
	import Figure from '$lib/Figure.svelte';
	import { Color } from '$lib/interfaces/color';

	export let text = 'ABCDABCDABDABCDAB';
	export let pattern = 'ABCDABD';
	let state: StringMatchingState;

	$: text, pattern, reset();
	$: pi = calcpi(pattern);

	let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
	let stop: () => undefined = () => undefined;

	const init = () => {
		clearTimeout(timeout);
		timeout = undefined;
		state = {
			text: text.split('').map((char) => ({ text: char, highlight: false } as BoxState)),
			pattern: pattern.split('').map((char) => ({ text: char, highlight: false } as BoxState)),
			shift: 0,
			focus: -1
		} as StringMatchingState;
	};

	const reset = () => (stop(), init());

	const next = () => {
		if (state.shift + state.focus + 1 >= state.text.length) return reset();
		if (timeout) clearTimeout(timeout), reveal();
		timeout = setTimeout(reveal, 750);
		advance();
	};

	const compare = () => state.focus < 0 || text[state.focus + state.shift] === pattern[state.focus];

	const advance = () => {
		if (compare()) state.focus++;
		else {
			if (state.focus === 0) state.shift++;
			const p = pi[state.focus - 1] ?? 0;
			state.shift += state.focus - p;
			state.focus = p;
		}
		clearSuffix();
		updateHighlights();
	};

	const reveal = () => {
		const cmp = compare();
		timeout = undefined;
		clearMarks();

		if (state.pattern[state.focus])
			state.pattern[state.focus].color = cmp ? Color.Green : Color.Red;
		if (cmp && state.focus === state.pattern.length - 1) match();
		if (!cmp) markCommonPrefix();
	};

	const markCommonPrefix = () => {
		const p = pi[state.focus - 1] ?? 0;
		for (let i = 0; i < p; i++) {
			const j = i + state.shift + state.focus - p;
			state.pattern[i].color = state.text[j].color = Color.Yellow;
		}
	};

	const clearSuffix = () => {
		for (let i = Math.max(0, state.focus); i < state.pattern.length; i++)
			state.pattern[i].color = undefined;
	};

	const clearMarks = () => {
		for (let i = 0; i < state.text.length; i++) state.text[i].color = undefined;
		for (let i = 0; i < state.pattern.length; i++)
			state.pattern[i].color = i < state.focus ? Color.Green : undefined;
	};

	const updateHighlights = () => {
		for (let i = 0; i < state.text.length; i++)
			state.text[i].highlight = i === state.shift + state.focus;
		for (let i = 0; i < state.pattern.length; i++) state.pattern[i].highlight = i === state.focus;
	};

	let trigger: () => any;
	const match = () => trigger();
</script>

<FullConfetti bind:trigger />

<Figure>
	<StingMatching slot="content" {state} />
	<svelte:fragment slot="buttons">
		<StepAnimationUnbounded {next} bind:stop interval={1500} />
		<button on:click={next}>Next</button>
		<button on:click={reset}>Reset</button>
	</svelte:fragment>
	<svelte:fragment slot="caption">
		A demonstration of the KMP String Matching Algorithm.
	</svelte:fragment>
</Figure>
