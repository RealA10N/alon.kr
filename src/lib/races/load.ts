import {
	bestEfforts,
	finishSeconds,
	isFinished,
	type Effort,
	type Photo,
	type Race,
	type RaceData
} from './race';

// Everything is bundled at build time: each race is a folder under src/races/
//   src/races/<slug>/race.json     race details, results, splits, Strava stats
//   src/races/<slug>/official/*    photos by the event photographers
//   src/races/<slug>/photos/*      my own photos
const dataGlobs = import.meta.glob<RaceData>('/src/races/*/race.json', {
	eager: true,
	import: 'default'
});

const imageGlobs = import.meta.glob<string>(
	'/src/races/*/{official,photos}/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}',
	{ eager: true, as: 'url' }
);

const slugOf = (path: string) => path.split('/')[3];

const photosOf = (slug: string, kind: 'official' | 'photos'): Photo[] =>
	Object.entries(imageGlobs)
		.filter(([path]) => path.startsWith(`/src/races/${slug}/${kind}/`))
		.map(([path, url]) => ({ url, file: path.split('/').pop() as string }))
		.sort((a, b) => a.file.localeCompare(b.file));

export const loadRaces = (): Race[] => {
	const races: Race[] = Object.entries(dataGlobs).map(([path, data]) => {
		const slug = slugOf(path);
		return {
			...data,
			slug,
			officialPhotos: photosOf(slug, 'official'),
			photos: photosOf(slug, 'photos')
		};
	});

	// Mark the official finishes that are still the fastest for their distance.
	for (const effort of personalBests(races)) {
		if (effort.source === 'Official') effort.race.isPersonalBest = true;
	}

	return races.sort((a, b) => b.date.localeCompare(a.date));
};

/** The fastest effort per distance, from official finishes and best efforts inside longer runs. */
export const personalBests = (races: Race[]): Effort[] => {
	const best = new Map<string, Effort>();
	const efforts: Effort[] = races.flatMap((race) => [
		...(isFinished(race)
			? [
					{
						label: race.distance.label,
						km: race.distance.km,
						seconds: finishSeconds(race) as number,
						source: 'Official' as const,
						race
					}
			  ]
			: []),
		...bestEfforts(race)
	]);
	for (const effort of efforts) {
		const current = best.get(effort.label);
		if (!current || effort.seconds < current.seconds) best.set(effort.label, effort);
	}
	return [...best.values()].sort((a, b) => a.km - b.km);
};

export const loadRace = (slug: string) => loadRaces().find((race) => race.slug === slug);
