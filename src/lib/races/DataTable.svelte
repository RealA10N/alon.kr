<script lang="ts" context="module">
	export type Row = {
		label: string;
		/** Missing values are shown as "—", so every race has the same rows. */
		value?: string | number;
		href?: string;
	};
</script>

<script lang="ts">
	export let rows: Row[];
</script>

<div class="overflow-x-auto">
	<table class="w-full text-base tabular-nums">
		<tbody>
			{#each rows as row}
				<tr>
					<th class="text-left font-normal w-1/2 sm:w-2/5">{row.label}</th>
					<td>
						{#if row.value === undefined || row.value === ''}
							—
						{:else if row.href}
							<a href={row.href} class="inline-block py-0.5">{row.value}</a>
						{:else}
							{row.value}
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
