import type { PageServerLoad } from './$types';
import { loadRaces, personalBests } from '$lib/races/load';

export const prerender = true;

export const load = (async () => {
	const races = loadRaces();
	const bests = personalBests(races).map(({ race, ...effort }) => ({
		...effort,
		slug: race.slug,
		name: race.name
	}));
	return { races, bests };
}) satisfies PageServerLoad;
