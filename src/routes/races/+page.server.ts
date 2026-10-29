import type { PageServerLoad } from './$types';
import { loadRaces } from '$lib/races/load';

export const prerender = true;

export const load = (async () => {
	return { races: loadRaces() };
}) satisfies PageServerLoad;
