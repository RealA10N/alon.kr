<script lang="ts">
	import Confetti from 'svelte-confetti';
	import RandomTransform from '$lib/effects/RandomTransform.svelte';

	let width: number, height: number;
	let nextKey = 0;
	let triggeredKeys: number[] = [];

	export let duration: number = 1500;
	export let delay: number = 150;
	export let parts: number = 2;
	$: px = width / parts;

	export const trigger = () => {
		const key = nextKey++;
		triggeredKeys = [key, ...triggeredKeys];
		setTimeout(() => remove(key), duration + delay * parts);
	};

	const remove = (key: number) => (triggeredKeys = triggeredKeys.filter((k) => k != key));
</script>

{#each triggeredKeys as key (key)}
	{#each Array(parts) as _, p}
		<RandomTransform x={[px * p, px * (p + 1)]} y={[0, height]}>
			<Confetti {duration} delay={[delay * p, delay * p + 50]} destroyOnComplete={false} />
		</RandomTransform>
	{/each}
{/each}

<div {...$$restProps} bind:clientWidth={width} bind:clientHeight={height}>
	<slot />
</div>
