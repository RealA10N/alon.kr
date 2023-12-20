<figure class="my-2 text-center">
	<slot name="content" />

	{#if $$slots.buttons}
		<div class="mt-4 sm:px-20 px-4 flex items-baseline justify-center flex-wrap">
			<slot name="buttons" />
		</div>
	{/if}

	<figcaption class="text-sm my-2 italic sm:px-12 px-2 mx-auto text-zinc-500">
		<slot name="caption" />
	</figcaption>
</figure>
