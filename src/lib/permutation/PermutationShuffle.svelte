<script lang="ts">
	import Permutations from '$lib/permutation/Permutations.svelte';
	import { factorial, idxToPerm, permIdx, shuffle } from '$lib/permutation/permutation';
	import AnimationButton from '$src/lib/AnimationButton.svelte';

	export let n: bigint = 8n;
	export let playOnMount = true;

	let userIdx: string = '1';
	let invalidUserInput: boolean = false;
	let stop: () => any;

	$: permutation = idxToPerm(0n, n);
	$: idx = permIdx(permutation, []);
	$: fact = factorial(n);
	$: permutation, validateUserInput();

	const shfl = () => (permutation = shuffle(permutation));
	const next = () => (permutation = idxToPerm((idx + 1n) % fact, n));

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
</script>

<figure>
	<Permutations {permutation} />
	<figcaption class="mt-4">
		<div class="my-1">
			<AnimationButton next={shfl} bind:stop {playOnMount} />
			<button on:click={shfl}>Shuffle</button>
			<button on:click={next}>Next</button>
		</div>
		Permutation #<span
			contenteditable
			class:invalidUserInput
			bind:textContent={userIdx}
			on:input={updateUserIdx}
			on:focus={stop}
		/>
		out of {n}!={fact} possible permutations of {n} elements.
	</figcaption>
</figure>

<style lang="postcss">
	span {
		@apply relative before:absolute before:left-0 before:-bottom-[1px]
			before:w-full before:h-[1px] focus:outline-none before:rounded
			before:scale-x-100 before:focus:scale-x-105 before:transition-all
			before:bg-zinc-400 before:focus:bg-zinc-600 dark:before:focus:bg-zinc-200;
	}

	.invalidUserInput {
		@apply before:bg-red-500 before:focus:bg-red-600;
	}
</style>
