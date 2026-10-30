<script lang="ts">
	import Metadata from '$lib/Metadata.svelte';
	import DataTable, { type Row } from '$lib/races/DataTable.svelte';
	import OfficialSplits from '$lib/races/OfficialSplits.svelte';
	import SplitsChart from '$lib/races/SplitsChart.svelte';
	import ElevationProfile from '$lib/races/ElevationProfile.svelte';
	import RouteMap from '$lib/races/RouteMap.svelte';
	import PacePlan from '$lib/races/PacePlan.svelte';
	import Gallery from '$lib/races/Gallery.svelte';
	import {
		distanceColor,
		finishSeconds,
		formatDate,
		formatPace,
		formatPlacement,
		formatTime,
		linkLabel,
		parseTime,
		targetPace
	} from '$lib/races/race';

	export let data;
	$: race = data.race;

	// Every race page shows the same sections and rows; missing values are shown as "—".
	// The result is kept raw: only what the timing company published, plus pace.
	$: finish = finishSeconds(race);
	$: goalPace = targetPace(race);
	$: official = race.official;
	$: strava = race.strava;
	$: photos = [...race.officialPhotos, ...race.photos];

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
		{ label: 'Category place', value: formatPlacement(official?.categoryPlace) }
	] satisfies Row[];

	const link = (label: string, href?: string): Row => ({
		label,
		value: href && linkLabel(href),
		href
	});

	$: links = [
		link('Official results', official?.resultsUrl),
		link('Event', race.eventUrl),
		link('Photo gallery', race.officialPhotosUrl)
	];
</script>

<Metadata title={race.name} description="{race.distance.label} · {formatDate(race.date)}" />

<p class="text-sm mb-0"><a href="/running" class="inline-block py-2">← Running</a></p>

<header class="flex flex-col items-center mb-4 text-zinc-700 dark:text-zinc-300">
	<h1 class="text-center mt-0">{race.name}</h1>
	<div class="flex flex-wrap items-center justify-center gap-2 text-base">
		<span class="tag inline-flex items-center gap-1.5">
			<span
				class="inline-block w-2.5 h-2.5 rounded-full"
				style="background: {distanceColor(race.distance.label, data.distances)}"
			/>{race.distance.label}
		</span>
		<span>{formatDate(race.date)}</span>
	</div>
</header>

<h2>Result</h2>
<DataTable rows={result} />

<h2>Official splits</h2>
<OfficialSplits
	splits={official?.splits ?? []}
	finishKm={race.distance.km}
	finishTime={official?.chipTime ?? official?.gunTime}
/>

<!-- Per-km details from Strava; races without Strava data skip the section entirely. -->
{#if strava}
	<div class="flex items-baseline justify-between gap-4">
		<h2>By kilometer</h2>
		{#if strava.url}<a href={strava.url} class="inline-block py-1 text-base">View on Strava</a>{/if}
	</div>
	{#if strava.splits && strava.splits.length > 0}
		<SplitsChart splits={strava.splits} />
	{/if}
	{#if strava.route || strava.profile}
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
