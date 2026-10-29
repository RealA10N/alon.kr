<script lang="ts">
	// Link to a race's Strava activity. Three styles while choosing one:
	// 'text' (a plain link), 'logo' (Strava's mark only), 'logo-text' (mark and "View on Strava").
	export let href: string;
	export let variant: 'text' | 'logo' | 'logo-text' = 'text';
</script>

{#if variant === 'text'}
	<a {href} class="inline-block py-1 text-base">View on Strava</a>
{:else}
	<a
		{href}
		aria-label="View on Strava"
		title="View on Strava"
		class="inline-flex items-center gap-1.5 p-1 -m-1 no-underline text-base font-bold text-[#fc4c02]"
	>
		<!-- Strava's mark, in its brand orange -->
		<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="#fc4c02">
			<path
				d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"
			/>
		</svg>
		{#if variant === 'logo-text'}<span>View on Strava</span>{/if}
	</a>
{/if}
