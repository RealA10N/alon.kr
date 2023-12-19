<figure class="my-2 text-sm text-center">
	<slot name="content" />

	{#if $$slots.buttons}
		<div class="mt-4 px-12 max-w-2xl">
			<slot name="buttons" />
		</div>
	{/if}

	<figcaption class="my-2 italic px-12 max-w-2xl mx-auto">
		<slot name="caption" />
	</figcaption>
</figure>
