<script lang="ts">
	import { formatPace, parseTime, type StravaSplit } from './race';

	export let splits: StravaSplit[];

	$: rows = splits.map((split, i) => ({
		...split,
		index: i + 1,
		pace: parseTime(split.time) / split.km
	}));
	// A short final split (e.g. the last 0.1 km) is too noisy to compare, so it doesn't set the scale.
	$: paces = rows.filter((row) => row.km >= 0.5).map((row) => row.pace);
	$: fastest = Math.min(...paces);
	$: slowest = Math.max(...paces);
	// Bars are relative to the slowest split, with the fastest split never shorter than 40%.
	$: barWidth = (pace: number) =>
		slowest === fastest
			? 100
			: Math.min(100, Math.max(40, 100 - ((pace - fastest) / (slowest - fastest)) * 60));
	$: hasElevation = rows.some((row) => row.elevGain !== undefined || row.elevLoss !== undefined);
	$: hasHr = rows.some((row) => row.avgHr !== undefined);
	$: hasCadence = rows.some((row) => row.cadence !== undefined);
</script>

<div class="overflow-x-auto">
	<table class="w-full text-base tabular-nums">
		<thead>
			<tr>
				<th class="text-left">Km</th>
				<th class="text-left">Pace</th>
				<th class="w-1/3" />
				{#if hasElevation}<th class="text-right">Elev</th>{/if}
				{#if hasHr}<th class="text-right">HR</th>{/if}
				{#if hasCadence}<th class="text-right">Cad</th>{/if}
			</tr>
		</thead>
		<tbody>
			{#if rows.length === 0}
				<tr><td>—</td><td>—</td><td /></tr>
			{/if}
			{#each rows as row}
				<tr>
					<td>{row.km === 1 ? row.index : (row.index - 1 + row.km).toFixed(2)}</td>
					<td class:font-bold={row.pace === fastest}>
						{formatPace(row.pace)}
					</td>
					<td>
						<div
							class="h-3 rounded-sm bg-red-500"
							class:opacity-60={row.pace !== fastest}
							style="width: {barWidth(row.pace)}%"
						/>
					</td>
					{#if hasElevation}
						<td class="text-right whitespace-nowrap">
							{#if row.elevGain}+{row.elevGain}{/if}
							{#if row.elevLoss}<span class="text-zinc-500">−{row.elevLoss}</span>{/if}
						</td>
					{/if}
					{#if hasHr}<td class="text-right">{row.avgHr ?? ''}</td>{/if}
					{#if hasCadence}<td class="text-right">{row.cadence ?? ''}</td>{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
