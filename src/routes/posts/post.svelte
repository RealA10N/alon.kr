<script>
	/** @type {string} */
	export let title;

	/** @type {string | undefined} */
	export let subtitle;
</script>

<h1>
	{title}
	{#if subtitle}
		<div class="font-light text-base">{subtitle}</div>
	{/if}
</h1>

<slot />
