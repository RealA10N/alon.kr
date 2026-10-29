<script lang="ts">
	import { onMount, type ComponentType } from 'svelte';
	import Metadata from '$lib/Metadata.svelte';
	import Header from '$lib/Header.svelte';
	import StatGrid, { type Stat } from '$lib/races/StatGrid.svelte';
	import OfficialSplits from '$lib/races/OfficialSplits.svelte';
	import StravaSplits from '$lib/races/StravaSplits.svelte';
	import ElevationProfile from '$lib/races/ElevationProfile.svelte';
	import RouteMap from '$lib/races/RouteMap.svelte';
	import PacePlan from '$lib/races/PacePlan.svelte';
	import Gallery from '$lib/races/Gallery.svelte';
	import {
		finishSeconds,
		formatDate,
		formatDelta,
		formatPace,
		formatPlacement,
		formatTime,
		parseTime,
		targetPace,
		targetSeconds
	} from '$lib/races/race';

	export let data;
	$: race = data.race;

	const reports = import.meta.glob<{ default: ComponentType }>('/src/races/*/report.md', {
		eager: true
	});
	$: report = reports[`/src/races/${race.slug}/report.md`]?.default;

	$: finish = finishSeconds(race);
	$: target = targetSeconds(race);
	$: goalPace = targetPace(race);
	$: official = race.official;
	$: strava = race.strava;

	let today: Date | null = null;
	onMount(() => (today = new Date()));
	$: daysLeft = today
		? Math.ceil((new Date(`${race.date}T00:00:00`).getTime() - today.getTime()) / 864e5)
		: undefined;

	$: summary = [
		{
			label: official?.chipTime ? 'Chip time' : 'Finish time',
			value: finish !== undefined ? formatTime(finish) : undefined,
			detail: race.isPersonalBest ? 'Personal best' : undefined,
			tone: 'good'
		},
		{
			label: 'Pace',
			value: finish !== undefined ? `${formatPace(finish / race.distance.km)} /km` : undefined
		},
		{
			label: 'Target',
			value: target !== undefined ? formatTime(target) : undefined,
			detail:
				target !== undefined && finish !== undefined
					? `${formatDelta(finish - target)} ${finish <= target ? 'ahead' : 'behind'}`
					: goalPace !== undefined
					? `${formatPace(goalPace)} /km`
					: undefined,
			tone: target !== undefined && finish !== undefined && finish > target ? 'bad' : 'good'
		},
		{ label: 'Gun time', value: official?.gunTime && formatTime(parseTime(official.gunTime)) },
		{ label: 'Overall', value: formatPlacement(official?.overall) },
		{ label: 'Gender', value: formatPlacement(official?.gender) },
		{
			label: official?.category ? `Category (${official.category})` : 'Category',
			value: formatPlacement(official?.categoryPlace)
		},
		{ label: 'Bib', value: official?.bib }
	] satisfies Stat[];

	$: stravaStats = strava
		? ([
				{ label: 'Distance', value: strava.distanceKm && `${strava.distanceKm.toFixed(2)} km` },
				{ label: 'Moving time', value: strava.movingTime },
				{ label: 'Elapsed time', value: strava.elapsedTime },
				{
					label: 'Avg pace',
					value:
						strava.distanceKm && (strava.movingTime || strava.elapsedTime)
							? `${formatPace(
									parseTime(strava.movingTime ?? strava.elapsedTime ?? '0') / strava.distanceKm
							  )} /km`
							: undefined
				},
				{
					label: 'Elevation',
					value: strava.elevationGain !== undefined ? `+${strava.elevationGain} m` : undefined,
					detail: strava.elevationLoss !== undefined ? `−${strava.elevationLoss} m` : undefined
				},
				{
					label: 'Min / max elev',
					value:
						strava.minElevation !== undefined && strava.maxElevation !== undefined
							? `${strava.minElevation}–${strava.maxElevation} m`
							: undefined
				},
				{ label: 'Avg HR', value: strava.avgHr && `${strava.avgHr} bpm` },
				{ label: 'Max HR', value: strava.maxHr && `${strava.maxHr} bpm` },
				{ label: 'Cadence', value: strava.cadence && `${strava.cadence} spm` },
				{ label: 'Power', value: strava.avgPower && `${strava.avgPower} W` },
				{ label: 'Calories', value: strava.calories },
				{
					label: 'Temperature',
					value: strava.temperature !== undefined ? `${strava.temperature}°C` : undefined
				},
				...Object.entries(strava.extra ?? {}).map(([label, value]) => ({ label, value }))
		  ] satisfies Stat[])
		: [];

	$: tags = [
		formatDate(race.date),
		race.distance.label,
		...(race.location ? [race.location] : []),
		...(finish === undefined && daysLeft !== undefined && daysLeft >= 0
			? [daysLeft === 0 ? 'Today!' : `In ${daysLeft} days`]
			: [])
	];
</script>

<Metadata title={race.name} description="{race.distance.label} · {formatDate(race.date)}" />

<p class="text-sm mb-0"><a href="/races">← All races</a></p>

<Header title={race.name} {tags} />

<StatGrid stats={summary} />

{#if finish === undefined}
	<p>
		{#if race.eventUrl}
			I'm registered for <a href={race.eventUrl}>{race.name}</a>.
		{:else}
			I'm registered for this race.
		{/if}
		{#if race.target?.note}{race.target.note}{/if}
	</p>
	{#if goalPace !== undefined}
		<h2>Pace plan</h2>
		<p>Checkpoint times at an even {formatPace(goalPace)} /km.</p>
		<PacePlan distanceKm={race.distance.km} pace={goalPace} />
	{/if}
{:else if race.target?.note}
	<p class="italic">{race.target.note}</p>
{/if}

{#if official}
	<h2>Official results</h2>
	{#if official.resultsUrl}
		<p>
			From the <a href={official.resultsUrl}>official results</a>{official.category
				? `, category ${official.category}`
				: ''}.
		</p>
	{/if}
	{#if official.splits && official.splits.length > 0}
		<OfficialSplits
			splits={official.splits}
			finishKm={race.distance.km}
			finishTime={official.chipTime ?? official.gunTime}
		/>
	{/if}
{/if}

{#if strava}
	<h2>Strava</h2>
	{#if strava.url}
		<p>My <a href={strava.url}>Strava activity</a>, as recorded by my watch.</p>
	{/if}
	<StatGrid stats={stravaStats} />

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

	{#if strava.splits && strava.splits.length > 0}
		<h3>Splits</h3>
		<StravaSplits splits={strava.splits} targetPace={goalPace} />
	{/if}
{/if}

{#if report}
	<h2>Race report</h2>
	<article class="text-justify">
		<svelte:component this={report} />
	</article>
{/if}

{#if race.officialPhotos.length > 0}
	<h2>Official photos</h2>
	{#if race.officialPhotosCredit || race.officialPhotosUrl}
		<p class="text-sm">
			Photos by
			{#if race.officialPhotosUrl}
				<a href={race.officialPhotosUrl}>{race.officialPhotosCredit ?? 'the event photographers'}</a
				>.
			{:else}
				{race.officialPhotosCredit}.
			{/if}
		</p>
	{/if}
	<Gallery photos={race.officialPhotos} alt="{race.name} official photo" />
{/if}

{#if race.photos.length > 0}
	<h2>My photos</h2>
	<Gallery photos={race.photos} alt="{race.name} photo" />
{/if}
