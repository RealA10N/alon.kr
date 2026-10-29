<script lang="ts" context="module">
	export const description = `Races I've run, with official results, splits and photos, and the ones I'm training for next.`;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Metadata from '$lib/Metadata.svelte';
	import PostCard from '$lib/PostCard.svelte';
	import {
		finishSeconds,
		formatDate,
		formatDelta,
		formatPace,
		formatTime,
		isFinished,
		targetPace,
		targetSeconds,
		type Race
	} from '$lib/races/race';

	export let data;

	$: upcoming = data.races.filter((race) => !isFinished(race)).reverse();
	$: featured = upcoming.filter((race) => race.featured);
	$: registered = upcoming.filter((race) => !race.featured);
	$: results = data.races.filter(isFinished);
	$: bests = results.filter((race) => race.isPersonalBest);

	// Countdowns depend on the current date, so they are only rendered in the browser.
	let today: Date | null = null;
	onMount(() => (today = new Date()));

	const countdown = (race: Race, now: Date | null) => {
		if (!now) return [];
		const days = Math.ceil((new Date(`${race.date}T00:00:00`).getTime() - now.getTime()) / 864e5);
		if (days < 0) return ['Results pending'];
		if (days === 0) return ['Today!'];
		return [days === 1 ? 'Tomorrow' : `In ${days} days`];
	};

	const targetText = (race: Race) => {
		const time = targetSeconds(race);
		const pace = targetPace(race);
		if (!time || !pace) return 'No target set yet.';
		return `Target ${formatTime(time)} (${formatPace(pace)} /km)`;
	};

	const upcomingTags = (race: Race, now: Date | null) => [
		formatDate(race.date),
		race.distance.label,
		...(race.location ? [race.location] : []),
		...countdown(race, now)
	];

	const resultTags = (race: Race) => {
		const time = finishSeconds(race) as number;
		const target = targetSeconds(race);
		const photos = race.officialPhotos.length + race.photos.length;
		return [
			formatDate(race.date),
			race.distance.label,
			formatTime(time),
			`${formatPace(time / race.distance.km)} /km`,
			...(race.isPersonalBest ? ['PB'] : []),
			...(target ? [`${formatDelta(time - target)} vs target`] : []),
			...(photos > 0 ? [`${photos} photo${photos === 1 ? '' : 's'}`] : [])
		];
	};
</script>

<Metadata title="Races" {description} />

<h1>Races 🏃</h1>
<p>{description}</p>

{#if featured.length + registered.length > 0}
	<h2>Up next</h2>
	{#each featured as race}
		<div class="border-l-4 border-red-500 rounded-lg">
			<PostCard
				title={race.name}
				description={targetText(race)}
				tags={upcomingTags(race, today)}
				href="/races/{race.slug}"
			/>
		</div>
	{/each}
	{#each registered as race}
		<PostCard
			title={race.name}
			description={targetText(race)}
			tags={upcomingTags(race, today)}
			href="/races/{race.slug}"
		/>
	{/each}
{/if}

{#if bests.length > 0}
	<h2>Personal bests</h2>
	<table class="w-full tabular-nums">
		<thead>
			<tr>
				<th class="text-left">Distance</th>
				<th class="text-right">Time</th>
				<th class="text-right">Pace</th>
				<th class="text-left">Race</th>
			</tr>
		</thead>
		<tbody>
			{#each bests.sort((a, b) => a.distance.km - b.distance.km) as race}
				{@const time = finishSeconds(race) ?? 0}
				<tr>
					<td>{race.distance.label}</td>
					<td class="text-right font-bold">{formatTime(time)}</td>
					<td class="text-right whitespace-nowrap">{formatPace(time / race.distance.km)} /km</td>
					<td><a href="/races/{race.slug}">{race.name}</a></td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

{#if results.length > 0}
	<h2>Results</h2>
	{#each results as race}
		<PostCard
			title={race.name}
			description={race.location}
			tags={resultTags(race)}
			href="/races/{race.slug}"
		/>
	{/each}
{/if}
