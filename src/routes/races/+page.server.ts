import type { PageServerLoad } from './$types';
import { loadRaces, personalBests } from '$lib/races/load';

export const prerender = true;

export const load = (async () => {
	const races = loadRaces();
	// Bests reference their race; send only the fields the page shows.
	const bests = personalBests(races).map(({ race, ...best }) => ({
		...best,
		slug: race.slug,
		name: race.name
	}));
	return { races, bests };
}) satisfies PageServerLoad;
