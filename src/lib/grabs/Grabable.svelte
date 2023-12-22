<script lang="ts">
	import { onMount } from 'svelte';
	import type { P } from './utils';

	let grabbingPointer: number | undefined;
	$: grabbed = grabbingPointer !== undefined;
	let dummyPosition: P, grabOffset: P;

	const grab = (e: PointerEvent) => {
		grabbingPointer = e.pointerId;
		grabOffset = { x: e.offsetX, y: e.offsetY };
		updateDummy(e);
	};
	const release = (e: PointerEvent) => {
		if (e.pointerId === grabbingPointer) grabbingPointer = undefined;
	};

	const move = (e: PointerEvent) => {
		if (e.pointerId === grabbingPointer) updateDummy(e);
	};

	const updateDummy = (e: PointerEvent) =>
		(dummyPosition = { x: e.clientX - grabOffset.x, y: e.clientY - grabOffset.y });

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
		style="top: {dummyPosition.y}px; left: {dummyPosition.x}px"
	>
		<slot name="floating" dummy={false} />
	</span>
{/if}
