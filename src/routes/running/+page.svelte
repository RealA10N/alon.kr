<script lang="ts" context="module">
	export const description = `Races I've run, with official results, splits and photos, and the ones I'm training for next.`;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Metadata from '$lib/Metadata.svelte';
	import ProgressChart from '$lib/races/ProgressChart.svelte';
	import RowList from '$lib/races/RowList.svelte';
	import {
		distanceColor,
		finishSeconds,
		formatDate,
		formatPace,
		formatTime,
		isFinished,
		parseTime,
		targetPace,
		targetSeconds,
		type Race
	} from '$lib/races/race';

	export let data;

	$: upcoming = data.races
		.filter((race) => !isFinished(race))
		.reverse()
		.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
	$: results = data.races.filter(isFinished);
	// The progress chart uses official full-race times only.
	$: official = results.flatMap((race) => {
		const time = race.official?.chipTime ?? race.official?.gunTime;
		return time
			? [
					{
						slug: race.slug,
						name: race.name,
						date: race.date,
						label: race.distance.label,
						km: race.distance.km,
						seconds: parseTime(time)
					}
			  ]
			: [];
	});

	// Countdowns depend on the current date, so they are only rendered in the browser.
	let today: Date | null = null;
	onMount(() => (today = new Date()));

	const daysLeft = (race: Race, now: Date | null) =>
		now
			? Math.ceil((new Date(`${race.date}T00:00:00`).getTime() - now.getTime()) / 864e5)
			: undefined;

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

	$: upcomingRows = upcoming.map((race) => {
		const target = targetSeconds(race);
		const goalPace = targetPace(race);
		const days = daysLeft(race, today);
		return {
			href: `/running/${race.slug}`,
			distance: race.distance.label,
			race: race.name,
			date: formatDate(race.date),
			time: target ? formatTime(target) : '—',
			pace: goalPace ? `${formatPace(goalPace)} /km` : '—',
			days: days !== undefined ? `${days} days` : '—'
		};
	});

	$: bestRows = data.bests.map(
		(best): Row => ({
			href: `/running/${best.slug}`,
			distance: best.label,
			race: best.name,
			date: formatDate(best.date),
			time: formatTime(best.seconds),
			pace: pace(best.seconds, best.km)
		})
	);

	$: resultRows = results.map((race): Row => {
		const time = finishSeconds(race) ?? 0;
		return {
			href: `/running/${race.slug}`,
			distance: race.distance.label,
			race: race.name,
			date: formatDate(race.date),
			time: formatTime(time),
			pace: pace(time, race.distance.km)
		};
	});

	// Distances keep the progress chart's colors in the lists and tables too.
	$: distances = [...new Set(data.races.map((race) => race.distance.label))];
	$: dotColor = (distance: string) => distanceColor(distance, distances);

	const toItems = (rows: (Row & { days?: string })[]) =>
		rows.map((row) => ({
			href: row.href,
			title: row.distance,
			color: dotColor(row.distance),
			value: row.time,
			valueSub: row.pace,
			meta: [row.race, row.date, ...(row.days ? [row.days] : [])]
		}));
</script>

<Metadata title="Running" {description} />

<h1>Running 🏃</h1>

{#if upcomingRows.length > 0}
	<h2>Up next</h2>
	<div class="sm:hidden"><RowList items={toItems(upcomingRows)} /></div>
	<div class="hidden sm:block overflow-x-auto">
		<table class="w-full text-base tabular-nums whitespace-nowrap">
			<thead>
				<tr>
					<th class="text-left">Distance</th>
					<th class="text-left">Race</th>
					<th class="text-left">Date</th>
					<th class="text-right">Target</th>
					<th class="text-right">Pace</th>
					<th class="text-right">Days</th>
				</tr>
			</thead>
			<tbody>
				{#each upcomingRows as row}
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
						<td class="text-right">{row.days}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

{#if official.length > 0}
	<ProgressChart results={official} />
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
