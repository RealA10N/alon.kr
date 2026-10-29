<script lang="ts">
	import { formatTime } from './race';
	import type { Result } from './ProgressChart.svelte';

	// Best official time per distance per year, with the change from the previous best.
	export let results: Result[];

	$: years = (() => {
		const all = results.map((r) => Number(r.date.slice(0, 4)));
		const first = Math.min(...all);
		return Array.from({ length: Math.max(...all) - first + 1 }, (_, i) => first + i);
	})();

	$: distances = [...new Map(results.map((r) => [r.label, r.km])).entries()]
		.sort((a, b) => a[1] - b[1])
		.map(([label]) => label);

	type Cell = { best: Result; change?: number; improvement: number } | null;

	// Columns run newest year first, so the latest season is visible without scrolling on a phone.
	// Changes are still computed in date order.
	$: columns = [...years].reverse();
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
		return { label, cells: byYear.reverse() };
	});

	// Three steps of the blue ramp: a bigger improvement on the previous best is darker.
	const shade = (improvement: number) =>
		improvement > 0.05 ? 'imp-3' : improvement > 0.02 ? 'imp-2' : improvement > 0 ? 'imp-1' : '';

	const change = (seconds: number) => `${seconds < 0 ? '−' : '+'}${formatTime(Math.abs(seconds))}`;
</script>

<div class="season-grid overflow-x-auto">
	<table class="w-full text-base tabular-nums whitespace-nowrap">
		<thead>
			<tr>
				<th class="text-left sticky left-0 z-10">Distance</th>
				{#each columns as year}
					<th class="text-right">{year}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row}
				<tr>
					<td class="sticky left-0 z-10 bg-zinc-100 dark:bg-zinc-900">{row.label}</td>
					{#each row.cells as cell}
						{#if cell}
							<td class="text-right {shade(cell.improvement)}">
								<a href="/races/{cell.best.slug}" class="font-bold no-underline">
									{formatTime(cell.best.seconds)}
								</a>
								<span class="block text-sm opacity-70">
									{cell.change === undefined ? 'first' : change(cell.change)}
								</span>
							</td>
						{:else}
							<td class="text-right opacity-40">—</td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	/* Sequential blue steps (dataviz reference ramp): light mode darkens with improvement,
	   dark mode uses deeper steps under light text. */
	.season-grid :global(.imp-1) {
		background: #cde2fb;
	}
	.season-grid :global(.imp-2) {
		background: #9ec5f4;
	}
	.season-grid :global(.imp-3) {
		background: #6da7ec;
	}
	.season-grid :global(.imp-1),
	.season-grid :global(.imp-2),
	.season-grid :global(.imp-3) {
		color: #27272a;
	}
	@media (prefers-color-scheme: dark) {
		.season-grid :global(.imp-1) {
			background: #184f95;
		}
		.season-grid :global(.imp-2) {
			background: #1c5cab;
		}
		.season-grid :global(.imp-3) {
			background: #256abf;
		}
		.season-grid :global(.imp-1),
		.season-grid :global(.imp-2),
		.season-grid :global(.imp-3) {
			color: #f4f4f5;
		}
	}
</style>
