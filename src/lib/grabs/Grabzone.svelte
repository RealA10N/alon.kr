<script context="module" lang="ts">
	interface Identifiable<Id> {
		id: Id;
	}
</script>

<script lang="ts" generics="Id, Item extends Identifiable<Id>">
	import { onMount } from 'svelte';
	import { flip, type FlipParams } from 'svelte/animate';
	import type { Writable } from 'svelte/store';
	import type { P } from './utils';

	export let flipOptions: FlipParams = {};
	export let items: Writable<Item[]>;

	let elements = [] as HTMLElement[];
	let grabbedId: Id | undefined;
	$: isGrabbed = grabbedId !== undefined;
	$: grabbedIdx = findGrabbedIdx(grabbedId);
	$: grabbedItem = grabbedIdx === undefined? undefined : $items.at(grabbedIdx);
	$: grabbedElement = grabbedIdx === undefined? undefined : elements.at(grabbedIdx);

	const findGrabbedIdx = (id: Id | undefined): number | undefined => {
		const idx = $items.findIndex(item => item.id === id);
		return idx === -1? undefined : idx;
	}

	let floatingElement: HTMLElement | undefined;
	let grabbingPointerId: number | undefined;
	let grabPos: P, grabOffset: P;

	const grab = (e: PointerEvent, item: Item) => {
		if (isGrabbed) return;
		grabbedId = item.id;
		grabbingPointerId = e.pointerId;
		grabOffset = {x:e.offsetX, y:e.offsetY};
		update(e);
	}

	const drag = (e: PointerEvent) => {
		if (!isGrabbed || e.pointerId !== grabbingPointerId) return;
		update(e);
	}

	const release = (e: PointerEvent) =>  {
		if (!isGrabbed || e.pointerId !== grabbingPointerId) return;
		grabbingPointerId = grabbedId = undefined;
	}

	const update = (e: PointerEvent) => {
		grabPos = {x: e.clientX - grabOffset.x, y:e.clientY - grabOffset.y};
	}

	onMount(() => {
		window.addEventListener('pointerup', release);
		window.addEventListener('pointermove', drag);
		return () => {
			window.removeEventListener('pointerup', release);
			window.removeEventListener('pointermove', drag);
		};
	});
</script>

{#each $items as item, idx (item.id)}
<span
	animate:flip={flipOptions}
	on:pointerdown={(e) => grab(e, item)}
	bind:this={elements[idx]}
>
	<slot {item} dummy={item.id === grabbedId} />
</span>
{/each}

{#if grabbedItem !== undefined}
	<span class="cursor-grabbing fixed" style="left: {grabPos.x}px; top: {grabPos.y}px" bind:this={floatingElement}>
		<slot item={grabbedItem} dummy={false}/>
	</span>
{/if}

<style lang="postcss">
	span {
		@apply inline-block select-none touch-none cursor-grab;
	}
</style>