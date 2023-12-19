<script lang="ts">
	import type { BoxState } from '$lib/interfaces/strings';
	import Array from '$lib/arrays/Array.svelte';
	import { shuffle } from '$lib/arrays/permutation';
	import Figure from '$lib/Figure.svelte';
	import ConfettiWrapper from '$lib/effects/ConfettiWrapper.svelte';
	import AnimationButton from '../AnimationButton.svelte';

	interface State {
		processing: number | null;
		goods: number;
		array: number[];
	}

	const init = (array: number[]) =>
		({
			processing: null,
			goods: 0,
			array: [...array]
		} as State);

	export let array: number[];
	$: state = init(array);
	$: n = array.length;
	$: uiArray = buildUiArray(state);

	const buildUiArray = (state: State): BoxState[] =>
		state.array.map(
			(val, idx) =>
				({
					text: val,
					highlight: idx === state.processing,
					color: isCorrect(idx) ? 'green' : undefined
				} as BoxState)
		);

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
</script>

<ConfettiWrapper bind:trigger={confetti}>
	<Figure>
		<Array array={uiArray} slot="content" />
		<svelte:fragment slot="buttons">
			<AnimationButton {next} bind:stop interval={800} />
			<button on:click={() => (stop(), next())}>Next</button>
			<button on:click={() => (stop(), shfl())}>Shuffle</button>
		</svelte:fragment>
		<svelte:fragment slot="caption">
			A demonstration of the Insertion Sort Algorithm: each new element is compared against the
			already ordered prefix, and placed in the among the prefix accordingly, increasing it's length
			by one.
		</svelte:fragment>
	</Figure>
</ConfettiWrapper>
