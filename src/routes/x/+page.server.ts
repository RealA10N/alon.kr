import moment from 'moment';
import type { PageServerLoad } from './$types';
import type { Package } from '$lib/interfaces/package';

export const prerender = true;

function globToUrl(glob: string) {
	const name = glob.split('/')[1];
	return ['x', name].join('/');
}

export const load = (async () => {
	const globs = import.meta.glob('./*/+page.md');

	const contents = await Promise.all(
		Object.entries(globs).map(async ([glob, fn]) => [globToUrl(glob), await fn()])
	);

	const packages = contents.map(([url, { metadata }]) => {
		metadata as Package;
		return {
			...metadata,
			relativeUrl: url,
			lastUpdate: moment(metadata.lastUpdate).unix() * 1000
		} as Package;
	});

	packages.sort((a, b) => a.lastUpdate - b.lastUpdate).reverse();

	return { packages };
}) satisfies PageServerLoad;
