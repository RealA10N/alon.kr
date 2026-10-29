<script lang="ts">
	import { onMount } from 'svelte';
	import Metadata from '$lib/Metadata.svelte';
	import Header from '$lib/Header.svelte';
	import DataTable, { type Row } from '$lib/races/DataTable.svelte';
	import OfficialSplits from '$lib/races/OfficialSplits.svelte';
	import StravaSplits from '$lib/races/StravaSplits.svelte';
	import SplitsChart from '$lib/races/SplitsChart.svelte';
	import ElevationProfile from '$lib/races/ElevationProfile.svelte';
	import RouteMap from '$lib/races/RouteMap.svelte';
	import PacePlan from '$lib/races/PacePlan.svelte';
	import Gallery from '$lib/races/Gallery.svelte';
	import {
		bestEfforts,
		finishSeconds,
		formatDate,
		formatDelta,
		formatPace,
		formatPlacement,
		formatTime,
		linkLabel,
		parseTime,
		targetPace,
		targetSeconds
	} from '$lib/races/race';

	export let data;
	$: race = data.race;

	// Every race page shows the same sections and rows; missing values are shown as "—".
	$: finish = finishSeconds(race);
	$: target = targetSeconds(race);
	$: goalPace = targetPace(race);
	$: official = race.official;
	$: strava = race.strava;
	$: photos = [...race.officialPhotos, ...race.photos];
	$: efforts = bestEfforts(race);

	let today: Date | null = null;
	onMount(() => (today = new Date()));
	$: daysLeft =
		today && finish === undefined
			? Math.ceil((new Date(`${race.date}T00:00:00`).getTime() - today.getTime()) / 864e5)
			: undefined;

	const time = (value?: string) => (value ? formatTime(parseTime(value)) : undefined);
	const km = (value: number) => `${Number.isInteger(value) ? value : value.toFixed(1)} km`;

	$: result = [
		{ label: 'Date', value: formatDate(race.date) },
		{ label: 'Distance', value: km(race.distance.km) },
		{ label: 'Location', value: race.location },
		{ label: 'Bib', value: official?.bib },
		{ label: 'Category', value: official?.category },
		{ label: 'Chip time', value: time(official?.chipTime) },
		{ label: 'Gun time', value: time(official?.gunTime) },
		{
			label: 'Pace',
			value: finish !== undefined ? `${formatPace(finish / race.distance.km)} /km` : undefined
		},
		{ label: 'Overall place', value: formatPlacement(official?.overall) },
		{ label: 'Gender place', value: formatPlacement(official?.gender) },
		{ label: 'Category place', value: formatPlacement(official?.categoryPlace) },
		{
			label: 'Personal best',
			value: finish !== undefined ? (race.isPersonalBest ? 'Yes' : 'No') : undefined
		},
		{ label: 'Target time', value: target !== undefined ? formatTime(target) : undefined },
		{
			label: 'Target pace',
			value: goalPace !== undefined ? `${formatPace(goalPace)} /km` : undefined
		},
		{
			label: 'Vs target',
			value: target !== undefined && finish !== undefined ? formatDelta(finish - target) : undefined
		},
		{ label: 'Days to race', value: daysLeft !== undefined && daysLeft >= 0 ? daysLeft : undefined }
	] satisfies Row[];

	$: stravaRows = [
		{ label: 'Distance', value: strava?.distanceKm && `${strava.distanceKm.toFixed(2)} km` },
		{ label: 'Moving time', value: time(strava?.movingTime) },
		{ label: 'Elapsed time', value: time(strava?.elapsedTime) },
		{
			label: 'Avg pace',
			value:
				strava?.distanceKm && (strava.movingTime || strava.elapsedTime)
					? `${formatPace(
							parseTime(strava.movingTime ?? strava.elapsedTime ?? '0') / strava.distanceKm
					  )} /km`
					: undefined
		},
		{
			label: 'Elevation gain',
			value: strava?.elevationGain !== undefined ? `${strava.elevationGain} m` : undefined
		},
		{
			label: 'Elevation loss',
			value: strava?.elevationLoss !== undefined ? `${strava.elevationLoss} m` : undefined
		},
		{ label: 'Avg heart rate', value: strava?.avgHr && `${strava.avgHr} bpm` },
		{ label: 'Max heart rate', value: strava?.maxHr && `${strava.maxHr} bpm` },
		{ label: 'Cadence', value: strava?.cadence && `${strava.cadence} spm` },
		...['5K', '10K'].map((label) => {
			const effort = efforts.find((effort) => effort.label === label);
			return {
				label: `Best ${label}`,
				value:
					effort && `${formatTime(effort.seconds)} (${formatPace(effort.seconds / effort.km)} /km)`
			};
		})
	] satisfies Row[];

	const link = (label: string, href?: string): Row => ({
		label,
		value: href && linkLabel(href),
		href
	});

	$: links = [
		link('Official results', official?.resultsUrl),
		link('Event', race.eventUrl),
		link('Strava activity', strava?.url),
		link('Photo gallery', race.officialPhotosUrl)
	];
</script>

<Metadata title={race.name} description="{race.distance.label} · {formatDate(race.date)}" />

<p class="text-sm mb-0"><a href="/races">← All races</a></p>

<Header title={race.name} />

<h2>Result</h2>
<DataTable rows={result} />

<h2>Official splits</h2>
<OfficialSplits
	splits={official?.splits ?? []}
	finishKm={race.distance.km}
	finishTime={official?.chipTime ?? official?.gunTime}
/>

<h2>Strava</h2>
<DataTable rows={stravaRows} />
{#if strava?.route || strava?.profile}
	<div class="grid sm:grid-cols-3 gap-4 items-center">
		{#if strava.route}
			<div class="sm:col-span-1"><RouteMap route={strava.route} /></div>
		{/if}
		{#if strava.profile}
			<div class={strava.route ? 'sm:col-span-2' : 'sm:col-span-3'}>
				<ElevationProfile profile={strava.profile} />
			</div>
		{/if}
	</div>
{/if}

<h3>Strava splits</h3>
{#if strava?.splits && strava.splits.length > 0}
	<SplitsChart splits={strava.splits} />
	<details class="text-base">
		<summary class="cursor-pointer text-sm">Table</summary>
		<StravaSplits splits={strava.splits} />
	</details>
{:else}
	<StravaSplits splits={[]} />
{/if}

{#if finish === undefined && goalPace !== undefined}
	<h2>Pace plan</h2>
	<PacePlan distanceKm={race.distance.km} pace={goalPace} />
{/if}

<h2>Photos</h2>
{#if photos.length > 0}
	<Gallery {photos} alt={race.name} />
{:else}
	<p>—</p>
{/if}

<h2>Links</h2>
<DataTable rows={links} />
