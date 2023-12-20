<script lang="ts">
	import { onMount } from 'svelte';

	type P = [number, number];

	const grab = (e: PointerEvent) => {
		grabbingPointer = e.pointerId;
		grabOffset = [e.offsetX, e.offsetY];
		const cursor = [e.clientX, e.clientY] as P;
		updateDummy(cursor);
	};
	const release = (e: PointerEvent) => {
		if (e.pointerId !== grabbingPointer) return;
		grabbingPointer = undefined;
	};

	const move = (e: PointerEvent) => {
		if (e.pointerId !== grabbingPointer) return;
		const cursor = [e.clientX, e.clientY] as P;
		updateDummy(cursor);
	};

	const updateDummy = (cursor: P) =>
		(dummyPosition = [cursor[0] - grabOffset[0], cursor[1] - grabOffset[1]]);

	let grabbingPointer: number | undefined;
	$: grabbed = grabbingPointer !== undefined;
	let dummyPosition: P, grabOffset: P;

	onMount(() => {
		window.addEventListener('pointerup', release);
		window.addEventListener('pointermove', move);
		return () => {
			window.removeEventListener('pointerup', release);
			window.removeEventListener('pointermove', move);
		};
	});
</script>

<span class="inline-block select-none cursor-grab" on:pointerdown={grab}>
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
