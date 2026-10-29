import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import { loadRace, loadRaces } from '$lib/races/load';

export const prerender = true;

export const entries = (() => loadRaces().map(({ slug }) => ({ slug }))) satisfies EntryGenerator;

export const load = (async ({ params }) => {
	const race = loadRace(params.slug);
	if (!race) throw error(404, 'Race not found');
	return { race };
}) satisfies PageServerLoad;
