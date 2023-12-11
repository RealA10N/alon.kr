<script lang="ts">
	import Kmp from '$src/lib/strings/StingMatching.svelte';
	import {
		LetterMode,
		type StringMatchingState,
		type LetterState
	} from '$lib/interfaces/stringMatching';
	import { calcpi } from '$lib/strings/kmp';
	import StepAnimationUnbounded from '$lib/StepAnimationUnbounded.svelte';

	let text = 'ABCDABCDABDABCDAB';
	let pattern = 'ABCDABD';
	let state: StringMatchingState;

	$: text, pattern, init();
	$: pi = calcpi(pattern);

	let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
	let stop: () => undefined;

	const init = () => {
		clearTimeout(timeout);
		timeout = undefined;
		state = {
			text: text
				.split('')
				.map((char) => ({ text: char, mode: LetterMode.Regular, highlight: false } as LetterState)),
			pattern: pattern
				.split('')
				.map((char) => ({ text: char, mode: LetterMode.Regular, highlight: false } as LetterState)),
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
			state.pattern[state.focus].mode = cmp ? LetterMode.Matching : LetterMode.NotMatching;

		if (cmp && state.focus === state.pattern.length - 1) match();
		if (!cmp) markCommonPrefix();
	};

	const markCommonPrefix = () => {
		const p = pi[state.focus - 1] ?? 0;
		for (let i = 0; i < p; i++) {
			const j = i + state.shift + state.pattern.length - p - 1;
			state.pattern[i].mode = state.text[j].mode = LetterMode.Marked;
		}
	};

	const clearSuffix = () => {
		for (let i = Math.max(0, state.focus); i < state.pattern.length; i++)
			state.pattern[i].mode = LetterMode.Regular;
	};

	const clearMarks = () => {
		for (let i = 0; i < state.text.length; i++) state.text[i].mode = LetterMode.Regular;
		for (let i = 0; i < state.pattern.length; i++)
			state.pattern[i].mode = i < state.focus ? LetterMode.Matching : LetterMode.Regular;
	};

	const updateHighlights = () => {
		for (let i = 0; i < state.text.length; i++)
			state.text[i].highlight = i === state.shift + state.focus;
		for (let i = 0; i < state.pattern.length; i++) state.pattern[i].highlight = i === state.focus;
	};

	const match = () => {
		console.log('match!');
	};
</script>

<Kmp {state} />
<StepAnimationUnbounded {next} {reset} bind:stop interval={1500} playOnMount={false} />

<div>
	<label for="text">Text:</label>
	<input type="text" name="text" id="text" bind:value={text} />
</div>

<div>
	<label for="pattern">Pattern:</label>
	<input type="text" name="pattern" id="pattern" bind:value={pattern} />
</div>
