<script lang="ts">
	export let x: [number, number], y: [number, number];
	const random = (a: number, b: number) => Math.random() * (b - a + 1) + a;
	$: dx = random(x[0], x[1]);
	$: dy = random(y[0], y[1]);
</script>

<div style="transform: translate({dx}px, {dy}px)">
	<slot />
</div>
