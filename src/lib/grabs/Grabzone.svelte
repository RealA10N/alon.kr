<script context="module" lang="ts">
	import type { Id, Identifiable } from './utils';
</script>

<script lang="ts" generics="Item extends Identifiable">
	import { onMount } from 'svelte';
	import { flip, type FlipParams } from 'svelte/animate';
	import { findClosestIdx, elementPos, type P, moveByIdx, findIdx } from './utils';

	export let flipOptions: FlipParams = {};
	export let items: Item[];

	let grabbedItem: Item | undefined;
	let elements = [] as HTMLElement[];
	let elementsPos = [] as P[];
	$: isGrabbed = grabbedItem !== undefined;

	let grabbingPointerId: number = -1;
	let grabPos: P, grabOffset: P;

	// callbacks for user of compoennt
	export let onGrab: (item: Item) => any = () => {};
	export let onUpdate: (item: Item) => any = () => {};
	export let onRelease: (item: Item) => any = () => {};

	const grab = (e: PointerEvent, item: Item) => {
		if (isGrabbed) return;
		grabbedItem = item;
		grabbingPointerId = e.pointerId;
		grabOffset = { x: e.offsetX, y: e.offsetY };
		saveElementsPositions();
		updateFloatingPos(e);
		updateItemsPositions();
		onGrab(item);
	};

	const drag = (e: PointerEvent) => {
		if (!isEventRelevent(e)) return;
		updateFloatingPos(e);
		updateItemsPositions();
	};

	const release = (e: PointerEvent) => {
		if (!isEventRelevent(e)) return;
		onRelease(grabbedItem!);
		grabbedItem = undefined;
	};

	const isEventRelevent = (e: PointerEvent) => isGrabbed && e.pointerId === grabbingPointerId;

	const updateFloatingPos = (e: PointerEvent) =>
		(grabPos = { x: e.clientX - grabOffset.x, y: e.clientY - grabOffset.y });

	const updateItemsPositions = () => {
		const closestIdx = findClosestIdx(grabPos, elementsPos)!;
		const grabbedIdx = findIdx(items, grabbedItem!.id);
		if (closestIdx === grabbedIdx) return;
		moveByIdx(items, grabbedIdx, closestIdx);
		items = items;
		onUpdate(grabbedItem!);
	};

	const saveElementsPositions = () => {
		for (const [idx, elem] of elements.entries()) elementsPos[idx] = elementPos(elem);
	};

	onMount(() => {
		window.addEventListener('pointerup', release);
		window.addEventListener('pointermove', drag);
		return () => {
			window.removeEventListener('pointerup', release);
			window.removeEventListener('pointermove', drag);
		};
	});
</script>

{#each items as item, idx (item.id)}
	<span animate:flip={flipOptions} on:pointerdown={(e) => grab(e, item)} bind:this={elements[idx]}>
		<slot {item} dummy={item === grabbedItem} />
	</span>
{/each}

{#if grabbedItem !== undefined}
	{#key items}
		<span class="cursor-grabbing fixed" style="left: {grabPos.x}px; top: {grabPos.y}px">
			<slot item={grabbedItem} dummy={false} />
		</span>
	{/key}
{/if}

<style lang="postcss">
	span {
		@apply inline-block select-none touch-none cursor-grab;
	}
</style>
