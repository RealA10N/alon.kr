import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import { loadRace, loadRaces } from '$lib/races/load';

export const prerender = true;

export const entries = (() => loadRaces().map(({ slug }) => ({ slug }))) satisfies EntryGenerator;

export const load = (async ({ params }) => {
	const race = loadRace(params.slug);
	if (!race) throw error(404, 'Race not found');
	// All distances, so the race keeps the same color as on the running page.
	const distances = [...new Set(loadRaces().map((r) => r.distance.label))];
	return { race, distances };
}) satisfies PageServerLoad;
