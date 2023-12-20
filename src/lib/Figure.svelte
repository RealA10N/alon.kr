<figure class="my-2 text-center">
	<slot name="content" />

	{#if $$slots.buttons}
		<div class="mt-4 sm:px-12 px-2 flex items-baseline justify-center flex-wrap">
			<slot name="buttons" />
		</div>
	{/if}

	<figcaption class="text-sm my-2 italic px-12 mx-auto text-zinc-500">
		<slot name="caption" />
	</figcaption>
</figure>
