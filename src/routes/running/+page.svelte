<script lang="ts" context="module">
	export const description = `Races I've run, with official results, splits and photos, and the ones coming up.`;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Metadata from '$lib/Metadata.svelte';
	import ProgressChart, { type Result } from '$lib/races/ProgressChart.svelte';
	import RowList from '$lib/races/RowList.svelte';
	import {
		daysUntil,
		distanceColor,
		finishSeconds,
		formatCountdown,
		formatDate,
		formatPace,
		formatTime
	} from '$lib/races/race';

	export let data;

	// Races with an official time, newest first. The chart and the results list both use these.
	$: results = data.races.flatMap((race): Result[] => {
		const seconds = finishSeconds(race);
		return seconds === undefined
			? []
			: [
					{
						slug: race.slug,
						name: race.name,
						date: race.date,
						label: race.distance.label,
						km: race.distance.km,
						seconds
					}
			  ];
	});

	const pace = (seconds: number, km: number) => `${formatPace(seconds / km)} /km`;

	// Each section builds its rows once; the phone list and the desktop table both render
	// these same fields, so the two views only differ in layout.
	type Row = {
		slug: string;
		href: string;
		distance: string;
		race: string;
		date: string;
		time: string;
		pace: string;
	};

	const toRow = (result: Result): Row => ({
		slug: result.slug,
		href: `/running/${result.slug}`,
		distance: result.label,
		race: result.name,
		date: formatDate(result.date),
		time: formatTime(result.seconds),
		pace: pace(result.seconds, result.km)
	});

	// Races I'm registered for: no official time yet, soonest first. Each shows a countdown and
	// the personal best at its distance, if there is one, in the time and pace columns.
	// The page is prerendered, so the countdown is recounted in the browser; the build-time
	// count is only the first paint.
	let now = new Date();
	onMount(() => (now = new Date()));

	$: upcomingRows = data.races
		.filter((race) => finishSeconds(race) === undefined && !hidden.has(race.distance.label))
		.sort((a, b) => a.date.localeCompare(b.date))
		.map((race): Row => {
			const best = data.bests.find((b) => b.label === race.distance.label);
			return {
				slug: race.slug,
				href: `/running/${race.slug}`,
				distance: race.distance.label,
				race: race.name,
				date: formatDate(race.date),
				time: formatCountdown(daysUntil(race.date, now)),
				pace: best ? `PB ${formatTime(best.seconds)}` : 'Debut'
			};
		});

	// Distances switched off in the chart, and the race highlighted in the chart or a table.
	let hidden = new Set<string>();
	let highlighted: string | null = null;

	$: bestRows = data.bests.filter((best) => !hidden.has(best.label)).map(toRow);
	$: resultRows = results
		.filter((result) => !hidden.has(result.label))
		.sort((a, b) => (sort.desc ? -1 : 1) * compare[sort.key](a, b))
		.map(toRow);

	// Results can be sorted by any column but the race name. Date starts newest first,
	// the others shortest or fastest first; choosing the same column again reverses it.
	type SortKey = 'distance' | 'date' | 'time' | 'pace';
	const compare: Record<SortKey, (a: Result, b: Result) => number> = {
		distance: (a, b) => a.km - b.km || b.date.localeCompare(a.date),
		date: (a, b) => a.date.localeCompare(b.date),
		time: (a, b) => a.seconds - b.seconds,
		pace: (a, b) => a.seconds / a.km - b.seconds / b.km
	};
	const sortKeys: { key: SortKey; label: string }[] = [
		{ key: 'distance', label: 'Distance' },
		{ key: 'date', label: 'Date' },
		{ key: 'time', label: 'Time' },
		{ key: 'pace', label: 'Pace' }
	];
	type Column = { key: SortKey | null; label: string; align: string };
	const columns: Column[] = [
		{ key: 'distance', label: 'Distance', align: 'text-left' },
		{ key: null, label: 'Race', align: 'text-left' },
		{ key: 'date', label: 'Date', align: 'text-left' },
		{ key: 'time', label: 'Time', align: 'text-right' },
		{ key: 'pace', label: 'Pace', align: 'text-right' }
	];
	const upcomingColumns: Column[] = [
		...columns.slice(0, 3),
		{ key: null, label: 'In', align: 'text-right' },
		{ key: null, label: 'To beat', align: 'text-right' }
	];
	let sort: { key: SortKey; desc: boolean } = { key: 'date', desc: true };
	const sortBy = (key: SortKey) =>
		(sort = { key, desc: sort.key === key ? !sort.desc : key === 'date' });
	const arrow = (key: SortKey, current: typeof sort) =>
		current.key === key ? (current.desc ? '↓' : '↑') : '';

	// Distances keep the progress chart's colors in the lists and tables too.
	$: distances = [...new Set(data.races.map((race) => race.distance.label))];
	$: dotColor = (distance: string) => distanceColor(distance, distances);

	const toItems = (rows: Row[]) =>
		rows.map((row) => ({
			href: row.href,
			highlighted: row.slug === highlighted,
			title: row.distance,
			color: dotColor(row.distance),
			value: row.time,
			valueSub: row.pace,
			meta: [row.race, row.date]
		}));
</script>

<Metadata title="Running" {description} />

<h1>Running 🏃</h1>

{#if results.length > 0}
	<ProgressChart {results} bind:hidden bind:highlighted />
{/if}

{#each [{ title: 'Personal bests', rows: bestRows, columns, sortable: false }, { title: 'Upcoming', rows: upcomingRows, columns: upcomingColumns, sortable: false }, { title: 'Results', rows: resultRows, columns, sortable: true }] as section}
	{#if section.rows.length > 0}
		<h2>{section.title}</h2>
		{#if section.sortable}
			<div
				class="sm:hidden flex flex-wrap items-center gap-1 mb-2"
				role="group"
				aria-label="Sort by"
			>
				<span class="text-sm mr-1">Sort by</span>
				{#each sortKeys as { key, label }}
					<button
						class="m-0 py-1 px-3 rounded-full"
						aria-pressed={sort.key === key}
						class:font-bold={sort.key === key}
						on:click={() => sortBy(key)}>{label} {arrow(key, sort)}</button
					>
				{/each}
			</div>
		{/if}
		<div class="sm:hidden"><RowList items={toItems(section.rows)} /></div>
		<div class="hidden sm:block overflow-x-auto">
			<table class="w-full text-base tabular-nums whitespace-nowrap">
				<thead>
					<tr>
						{#each section.columns as column}
							{@const key = column.key}
							{#if section.sortable && key}
								<th
									class={column.align}
									aria-sort={sort.key === key ? (sort.desc ? 'descending' : 'ascending') : 'none'}
								>
									<button class="sort" on:click={() => sortBy(key)}
										>{column.label}<span class="inline-block w-3">{arrow(key, sort)}</span></button
									>
								</th>
							{:else}
								<th class={column.align}>{column.label}</th>
							{/if}
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each section.rows as row}
						<tr
							class={row.slug === highlighted ? 'bg-zinc-200 dark:bg-zinc-800' : ''}
							on:pointerenter={() => (highlighted = row.slug)}
							on:pointerleave={() => (highlighted = null)}
							on:focusin={() => (highlighted = row.slug)}
							on:focusout={() => (highlighted = null)}
						>
							<td class="font-bold">
								<span
									class="inline-block w-2.5 h-2.5 rounded-full mr-1.5"
									style="background: {dotColor(row.distance)}"
								/>{row.distance}
							</td>
							<td><a href={row.href}>{row.race}</a></td>
							<td>{row.date}</td>
							<td class="text-right">{row.time}</td>
							<td class="text-right">{row.pace}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
{/each}

<style>
	/* Column headers sort the table; they keep the header's look instead of the site's tag buttons. */
	button.sort {
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: transparent;
		font: inherit;
		color: inherit;
	}
	button.sort:hover {
		background: transparent;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
