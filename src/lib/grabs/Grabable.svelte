<script lang="ts">
	import { onMount } from 'svelte';

	type P = [number, number];

	let grabbingPointer: number | undefined;
	$: grabbed = grabbingPointer !== undefined;
	let dummyPosition: P, grabOffset: P;

	const grab = (e: PointerEvent) => {
		grabbingPointer = e.pointerId;
		grabOffset = [e.offsetX, e.offsetY];
		updateDummy(e);
	};
	const release = (e: PointerEvent) => {
		if (e.pointerId === grabbingPointer) grabbingPointer = undefined;
	};

	const move = (e: PointerEvent) => {
		if (e.pointerId === grabbingPointer) updateDummy(e);
	};

	const updateDummy = (e: PointerEvent) =>
		(dummyPosition = [e.clientX - grabOffset[0], e.clientY - grabOffset[1]]);

	onMount(() => {
		window.addEventListener('pointerup', release);
		window.addEventListener('pointermove', move);
		return () => {
			window.removeEventListener('pointerup', release);
			window.removeEventListener('pointermove', move);
		};
	});
</script>

<span class="inline-block select-none cursor-grab touch-none" on:pointerdown={grab}>
	<slot dummy={grabbed} />
</span>

{#if grabbed}
	<span
		class="inline-block select-none fixed cursor-grabbing"
		style="top: {dummyPosition[1]}px; left: {dummyPosition[0]}px"
	>
		<slot dummy={false} />
	</span>
{/if}
