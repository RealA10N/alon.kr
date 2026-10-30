<script lang="ts" context="module">
	export const description = `Races I've run, with official results, splits and photos.`;
</script>

<script lang="ts">
	import Metadata from '$lib/Metadata.svelte';
	import ProgressChart, { type Result } from '$lib/races/ProgressChart.svelte';
	import RowList from '$lib/races/RowList.svelte';
	import {
		distanceColor,
		finishSeconds,
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
		href: string;
		distance: string;
		race: string;
		date: string;
		time: string;
		pace: string;
	};

	const toRow = (result: Result): Row => ({
		href: `/running/${result.slug}`,
		distance: result.label,
		race: result.name,
		date: formatDate(result.date),
		time: formatTime(result.seconds),
		pace: pace(result.seconds, result.km)
	});

	$: bestRows = data.bests.map(toRow);
	$: resultRows = results.map(toRow);

	// Distances keep the progress chart's colors in the lists and tables too.
	$: distances = [...new Set(data.races.map((race) => race.distance.label))];
	$: dotColor = (distance: string) => distanceColor(distance, distances);

	const toItems = (rows: Row[]) =>
		rows.map((row) => ({
			href: row.href,
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
	<ProgressChart {results} />
{/if}

{#each [{ title: 'Personal bests', rows: bestRows }, { title: 'Results', rows: resultRows }] as section}
	{#if section.rows.length > 0}
		<h2>{section.title}</h2>
		<div class="sm:hidden"><RowList items={toItems(section.rows)} /></div>
		<div class="hidden sm:block overflow-x-auto">
			<table class="w-full text-base tabular-nums whitespace-nowrap">
				<thead>
					<tr>
						<th class="text-left">Distance</th>
						<th class="text-left">Race</th>
						<th class="text-left">Date</th>
						<th class="text-right">Time</th>
						<th class="text-right">Pace</th>
					</tr>
				</thead>
				<tbody>
					{#each section.rows as row}
						<tr>
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
