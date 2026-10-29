<script lang="ts">
	import { distanceColor, formatTime } from './race';
	import type { Result } from './ProgressChart.svelte';

	// Best official time per distance per year, with the change from the previous best.
	export let results: Result[];

	// Only years with a race, newest first, so the latest season is visible without
	// scrolling on a phone. Changes are still computed in date order.
	$: years = [...new Set(results.map((r) => Number(r.date.slice(0, 4))))].sort((a, b) => a - b);
	$: columns = [...years].reverse();

	$: distances = [...new Map(results.map((r) => [r.label, r.km])).entries()]
		.sort((a, b) => a[1] - b[1])
		.map(([label]) => label);

	type Cell = { best: Result; change?: number; improvement: number } | null;

	$: rows = distances.map((label) => {
		let previous = Infinity;
		const byYear: Cell[] = years.map((year) => {
			const best = results
				.filter((r) => r.label === label && r.date.startsWith(`${year}`))
				.sort((a, b) => a.seconds - b.seconds)[0];
			if (!best) return null;
			const cell = {
				best,
				change: previous === Infinity ? undefined : best.seconds - previous,
				improvement: previous === Infinity ? 0 : Math.max(0, (previous - best.seconds) / previous)
			};
			previous = Math.min(previous, best.seconds);
			return cell;
		});
		return { label, color: distanceColor(label, distances), cells: byYear.reverse() };
	});

	// A tint of the distance's own color: a bigger improvement on the previous best is stronger.
	const tint = (color: string, improvement: number) => {
		const strength = improvement > 0.05 ? 55 : improvement > 0.02 ? 35 : improvement > 0 ? 18 : 0;
		return strength ? `background: color-mix(in srgb, ${color} ${strength}%, transparent)` : '';
	};

	const change = (seconds: number) => `${seconds < 0 ? '−' : '+'}${formatTime(Math.abs(seconds))}`;
</script>

<div class="overflow-x-auto">
	<table class="w-full text-base tabular-nums">
		<thead>
			<tr>
				<th class="text-left sticky left-0 z-10 px-1.5 sm:px-2">Distance</th>
				{#each columns as year}
					<th class="text-right px-1.5 sm:px-2">{year}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row}
				<tr>
					<td class="sticky left-0 z-10 bg-zinc-100 dark:bg-zinc-900 px-1.5 sm:px-2">
						<span class="flex items-center gap-1.5">
							<span
								class="inline-block w-2.5 h-2.5 rounded-full shrink-0"
								style="background: {row.color}"
							/>
							{row.label}
						</span>
					</td>
					{#each row.cells as cell}
						{#if cell}
							<td
								class="text-right whitespace-nowrap px-1.5 sm:px-2"
								style={tint(row.color, cell.improvement)}
							>
								<a href="/running/{cell.best.slug}" class="font-bold no-underline block">
									{formatTime(cell.best.seconds)}
								</a>
								<span class="block text-sm opacity-70">
									{cell.change === undefined ? 'first' : change(cell.change)}
								</span>
							</td>
						{:else}
							<td class="text-right opacity-40 px-1.5 sm:px-2">—</td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
