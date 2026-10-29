<script lang="ts">
	import type { Photo } from './race';

	export let photos: Photo[];
	export let alt: string;

	let open: number | null = null;

	const show = (i: number) => (open = (i + photos.length) % photos.length);
	const close = () => (open = null);

	const onKey = (event: KeyboardEvent) => {
		if (open === null) return;
		if (event.key === 'Escape') close();
		if (event.key === 'ArrowRight') show(open + 1);
		if (event.key === 'ArrowLeft') show(open - 1);
	};
</script>

<svelte:window on:keydown={onKey} />

<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 my-4">
	{#each photos as photo, i}
		<a
			href={photo.url}
			class="block no-underline"
			on:click|preventDefault={() => show(i)}
			title={photo.caption}
		>
			<img
				src={photo.url}
				alt={photo.caption ?? alt}
				loading="lazy"
				class="w-full aspect-[4/3] object-cover rounded-md shadow-sm hover:shadow-md transition-shadow"
			/>
		</a>
	{/each}
</div>

{#if open !== null}
	<div
		class="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
		<div class="absolute inset-0" on:click={close} />
		<img
			src={photos[open].url}
			alt={photos[open].caption ?? alt}
			class="relative max-h-[80vh] max-w-full rounded-md"
		/>
		<div class="relative mt-3 flex items-center gap-2 text-zinc-200">
			{#if photos.length > 1}
				<button class="text-zinc-200 border-zinc-200" on:click={() => show((open ?? 0) - 1)}>
					←
				</button>
			{/if}
			<span class="text-sm italic px-2">
				{photos[open].caption ?? ''}
				<span class="text-zinc-400 not-italic">{open + 1} / {photos.length}</span>
			</span>
			{#if photos.length > 1}
				<button class="text-zinc-200 border-zinc-200" on:click={() => show((open ?? 0) + 1)}>
					→
				</button>
			{/if}
			<button class="text-zinc-200 border-zinc-200" on:click={close}>Close</button>
			<a href={photos[open].url} class="text-sm text-zinc-200 decoration-zinc-400" download>
				Original
			</a>
		</div>
	</div>
{/if}
