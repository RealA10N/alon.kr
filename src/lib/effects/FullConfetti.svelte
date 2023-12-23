<script lang="ts">
	import { Confetti } from 'svelte-confetti';

	export let duration: number = 1500;
	export let delay: number = 1000;

	let nextKey = 0;
	let triggeredKeys: number[] = [];

	export const trigger = () => {
		triggeredKeys = [nextKey++, ...triggeredKeys];
		setTimeout(triggeredKeys.pop, duration + delay);
	};
</script>

<div
	class="fixed -top-10 left-0
		h-screen w-screen overflow-hidden pointer-events-none
		flex justify-center"
>
	{#each triggeredKeys as key (key)}
		<Confetti
			x={[-5, 5]}
			y={[0, 0.1]}
			delay={[0, delay]}
			{duration}
			amount={150}
			fallDistance="500px"
		/>
	{/each}
</div>
