<script lang="ts">
	import type { BoxState as GenericBoxState } from '$lib/interfaces/strings';
	import Array from '$lib/arrays/Array.svelte';
	import { shuffle } from '$lib/arrays/permutation';
	import Figure from '$lib/Figure.svelte';
	import ConfettiWrapper from '$lib/effects/ConfettiWrapper.svelte';
	import AnimationButton from '$lib/AnimationButton.svelte';
	import { writable } from 'svelte/store';
	import { Color } from '../graphs/graphs';

	type BoxState = GenericBoxState<number>;

	interface State {
		processing: number | null;
		goods: number;
		array: number[];
	}

	const init = (array: number[]) => ({
		processing: null,
		goods: 0,
		array: [...array]
	});

	export let array: number[];
	$: state = init(array);
	$: n = array.length;

	const buildUiArray = (state: State): BoxState[] =>
		state.array.map((val, idx) => ({
			id: val.toString(),
			text: val,
			highlight: idx === state.processing,
			color: isCorrect(idx) ? Color.Green : undefined
		}));

	let uiArray = writable([] as BoxState[]);
	$: $uiArray = buildUiArray(state);

	const next = () => {
		if (state.processing === null) {
			if (state.goods === n) shfl();
			else state.processing = state.goods;
		} else {
			let i = state.processing;
			const stop = i == 0 || state.array[i] > state.array[i - 1];
			if (stop) {
				state.goods++;
				state.processing = null;
				if (state.goods === n) return confetti(), 2000;
			} else {
				state.processing--;
				[state.array[i], state.array[i - 1]] = [state.array[i - 1], state.array[i]];
			}
		}
	};

	let confetti: () => any;
	let stop: () => any;
	const shfl = () => (array = shuffle(array));

	const isCorrect = (idx: number): boolean =>
		idx !== state.processing && idx < state.goods + (state.processing !== null ? 1 : 0);

	const reset = () => (state = init(state.array));

	const updateFromUser = () => (state.array = $uiArray.map((state) => state.text));
</script>

<ConfettiWrapper bind:trigger={confetti}>
	<Figure>
		<Array
			items={uiArray}
			slot="content"
			onGrab={() => (stop(), reset())}
			onUpdate={updateFromUser}
		/>
		<svelte:fragment slot="buttons">
			<AnimationButton {next} bind:stop interval={800} />
			<button on:click={() => (stop(), next())}>Next</button>
			<button on:click={() => (stop(), shfl())}>Shuffle</button>
		</svelte:fragment>
		<svelte:fragment slot="caption">
			The Insertion Sort Algorithm: each new element is compared against the already ordered prefix,
			and placed among the prefix accordingly, preserving the order and increasing it's length by
			one.
		</svelte:fragment>
	</Figure>
</ConfettiWrapper>
