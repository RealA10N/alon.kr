<script>
	/** @type {string} */
	export let title;

	/** @type {string | undefined} */
	export let subtitle;
</script>

<h1>
	{title}
	{#if subtitle}
		<div class="font-light text-sm opacity-50">{subtitle}</div>
	{/if}
</h1>

<div class="text-justify">
	<slot />
</div>
