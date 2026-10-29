import type { PageServerLoad } from './$types';
import { loadRaces, personalBests } from '$lib/races/load';
import type { Effort } from '$lib/races/race';

export const prerender = true;

// Efforts reference their race; send only the fields the page shows.
const summary = ({ race, ...effort }: Effort) => ({ ...effort, slug: race.slug, name: race.name });

export const load = (async () => {
	const races = loadRaces();
	return {
		races,
		officialBests: personalBests(races, 'Official').map(summary),
		unofficialBests: personalBests(races, 'Strava').map(summary)
	};
}) satisfies PageServerLoad;
