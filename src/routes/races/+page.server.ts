import type { PageServerLoad } from './$types';
import { allEfforts, loadRaces, personalBests } from '$lib/races/load';
import type { Effort } from '$lib/races/race';

export const prerender = true;

// Efforts reference their race; send only the fields the page shows.
const summary = ({ race, ...effort }: Effort) => ({
	...effort,
	slug: race.slug,
	name: race.name,
	year: Number(race.date.slice(0, 4)),
	isPersonalBest: false
});

export const load = (async () => {
	const races = loadRaces();
	const officialBests = personalBests(races, 'Official');
	const unofficialBests = personalBests(races, 'Strava');
	const bests = new Set([...officialBests, ...unofficialBests]);
	return {
		races,
		officialBests: officialBests.map(summary),
		unofficialBests: unofficialBests.map(summary),
		efforts: allEfforts(races).map((effort) => ({
			...summary(effort),
			isPersonalBest: [...bests].some(
				(best) =>
					best.race === effort.race && best.label === effort.label && best.source === effort.source
			)
		}))
	};
}) satisfies PageServerLoad;
