<figure class="my-2 text-center">
	<slot name="content" />

	{#if $$slots.buttons}
		<div class="mt-4 px-12">
			<slot name="buttons" />
		</div>
	{/if}

	<figcaption class="text-sm my-2 italic px-12 mx-auto">
		<slot name="caption" />
	</figcaption>
</figure>
