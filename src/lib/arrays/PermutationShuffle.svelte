<script lang="ts">
	import type { BoxState } from '$lib/interfaces/strings';

	import Figure from '$lib/Figure.svelte';
	import Array from '$lib/arrays/Array.svelte';
	import AnimationButton from '$src/lib/AnimationButton.svelte';
	import {
		factorial,
		idxToPerm,
		permIdx,
		shuffle,
		type Permutation
	} from '$lib/arrays/permutation';
	import { writable } from 'svelte/store';

	type State = BoxState<bigint>;

	export let n: bigint = 8n;
	export let playOnMount = true;

	let userIdx: string = '1';
	let invalidUserInput: boolean = false;
	let stop: () => any;

	$: permutation = idxToPerm(0n, n);
	$: idx = permIdx(permutation, []);
	$: fact = factorial(n);
	$: permutation, validateUserInput();

	let items = writable([] as State[]);
	$: $items = permutationToItems(permutation);

	const shfl = () => (permutation = shuffle(permutation));
	const next = () => (permutation = idxToPerm((idx + 1n) % fact, n));
	const animate = () => {
		(n <= 3 ? next : shfl)();
	};

	const invalidateUserIdx = () => (invalidUserInput = true);
	const validateUserInput = () => ((userIdx = (idx + 1n).toString()), (invalidUserInput = false));

	const updateUserIdx = () => {
		stop();
		try {
			const idx = BigInt(userIdx);
			if (idx <= 0n || idx > fact) return invalidateUserIdx();
			permutation = idxToPerm(idx - 1n, n);
			validateUserInput();
		} catch (error) {
			return invalidateUserIdx();
		}
	};

	const permutationToItems = (permutation: Permutation): State[] =>
		permutation.map((val) => ({ text: val + 1n, id: val.toString() } as State));

	const itemsToPermutation = (items: State[]): Permutation =>
		items.map((item) => (item.text - 1n) as bigint);

	const updateFromUser = () => (permutation = itemsToPermutation($items));
</script>

<Figure>
	<Array slot="content" {items} onGrab={stop} onUpdate={updateFromUser} />

	<svelte:fragment slot="buttons">
		<AnimationButton next={animate} bind:stop {playOnMount} />
		<button on:click={() => (stop(), shfl())}>Shuffle</button>
		<button on:click={() => (stop(), next())}>Next</button>
	</svelte:fragment>

	<svelte:fragment slot="caption">
		Permutation #<span
			inputmode="numeric"
			contenteditable
			class:invalidUserInput
			bind:textContent={userIdx}
			on:input={updateUserIdx}
			on:focus={stop}
		/>
		out of {n}!={fact} possible permutations of {n} elements.
	</svelte:fragment>
</Figure>

<style lang="postcss">
	span {
		@apply relative before:absolute before:left-0 before:-bottom-[1px]
			before:w-full before:h-[1px] focus:outline-none before:rounded
			before:scale-x-100 before:focus:scale-x-105 before:transition-all
			before:bg-zinc-500 before:focus:bg-zinc-700 dark:before:focus:bg-zinc-400;
	}

	.invalidUserInput {
		@apply before:bg-red-500 before:focus:bg-red-600;
	}
</style>
