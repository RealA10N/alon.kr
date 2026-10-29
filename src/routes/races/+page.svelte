<script lang="ts" context="module">
	export const description = `Races I've run, with official results, splits and photos, and the ones I'm training for next.`;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Metadata from '$lib/Metadata.svelte';
	import ProgressChart from '$lib/races/ProgressChart.svelte';
	import SeasonGrid from '$lib/races/SeasonGrid.svelte';
	import RowList from '$lib/races/RowList.svelte';
	import {
		finishSeconds,
		formatDate,
		formatPace,
		formatPlacement,
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
	const or = (value: string | number | undefined) => value ?? '—';
</script>

<Metadata title="Races" {description} />

<h1>Races 🏃</h1>

{#if upcoming.length > 0}
	<h2>Up next</h2>
	<div class="sm:hidden">
		<RowList
			items={upcoming.map((race) => {
				const target = targetSeconds(race);
				const goalPace = targetPace(race);
				const days = daysLeft(race, today);
				return {
					href: `/races/${race.slug}`,
					title: race.name,
					value: target ? formatTime(target) : undefined,
					valueSub: goalPace ? `${formatPace(goalPace)} /km` : undefined,
					meta: [formatDate(race.date), ...(days !== undefined ? [`${days} days`] : [])]
				};
			})}
		/>
	</div>
	<div class="hidden sm:block overflow-x-auto">
		<table class="w-full text-base tabular-nums whitespace-nowrap">
			<thead>
				<tr>
					<th class="text-left">Date</th>
					<th class="text-left">Race</th>
					<th class="text-left">Distance</th>
					<th class="text-right">Target</th>
					<th class="text-right">Pace</th>
					<th class="text-right">Days</th>
				</tr>
			</thead>
			<tbody>
				{#each upcoming as race}
					{@const target = targetSeconds(race)}
					{@const goalPace = targetPace(race)}
					<tr>
						<td>{formatDate(race.date)}</td>
						<td>
							<a href="/races/{race.slug}">{race.name}</a>
							{#if race.featured}<span class="text-red-500" title="Featured">●</span>{/if}
						</td>
						<td>{race.distance.label}</td>
						<td class="text-right">{target ? formatTime(target) : '—'}</td>
						<td class="text-right">{goalPace ? `${formatPace(goalPace)} /km` : '—'}</td>
						<td class="text-right">{or(daysLeft(race, today))}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

{#if official.length > 0}
	<h2>Progress</h2>
	<ProgressChart results={official} />

	<h2>Season bests</h2>
	<SeasonGrid results={official} />
{/if}

{#if data.bests.length > 0}
	<h2>Personal bests</h2>
	<div class="sm:hidden">
		<RowList
			items={data.bests.map((best) => ({
				href: `/races/${best.slug}`,
				title: best.label,
				value: formatTime(best.seconds),
				valueSub: pace(best.seconds, best.km),
				meta: [best.name, formatDate(best.date)]
			}))}
		/>
	</div>
	<div class="hidden sm:block overflow-x-auto">
		<table class="w-full text-base tabular-nums whitespace-nowrap">
			<thead>
				<tr>
					<th class="text-left">Distance</th>
					<th class="text-right">Time</th>
					<th class="text-right">Pace</th>
					<th class="text-left pl-4">Race</th>
				</tr>
			</thead>
			<tbody>
				{#each data.bests as best}
					<tr>
						<td>{best.label}</td>
						<td class="text-right font-bold">{formatTime(best.seconds)}</td>
						<td class="text-right">{pace(best.seconds, best.km)}</td>
						<td class="pl-4"><a href="/races/{best.slug}">{best.name}</a></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

{#if results.length > 0}
	<h2>Results</h2>
	<div class="sm:hidden">
		<RowList
			items={results.map((race) => {
				const time = finishSeconds(race) ?? 0;
				return {
					href: `/races/${race.slug}`,
					title: race.name,
					value: formatTime(time),
					valueSub: pace(time, race.distance.km),
					meta: [formatDate(race.date)]
				};
			})}
		/>
	</div>
	<div class="hidden sm:block overflow-x-auto">
		<table class="w-full text-base tabular-nums whitespace-nowrap">
			<thead>
				<tr>
					<th class="text-left">Date</th>
					<th class="text-left">Race</th>
					<th class="text-right">Time</th>
					<th class="text-right">Pace</th>
					<th class="text-right">Place</th>
				</tr>
			</thead>
			<tbody>
				{#each results as race}
					{@const time = finishSeconds(race) ?? 0}
					<tr>
						<td>{formatDate(race.date)}</td>
						<td><a href="/races/{race.slug}">{race.name}</a></td>
						<td class="text-right">{formatTime(time)}</td>
						<td class="text-right">{pace(time, race.distance.km)}</td>
						<td class="text-right">{or(formatPlacement(race.official?.overall))}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
