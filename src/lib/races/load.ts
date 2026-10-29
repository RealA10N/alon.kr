import { officialSeconds, type Effort, type Photo, type Race, type RaceData } from './race';

// Everything is bundled at build time: each race is a folder under src/races/
//   src/races/<slug>/race.json     race details, results, splits, Strava stats
//   src/races/<slug>/official/*    official photos and finish-line videos (<name>.poster.jpg
//                                  beside <name>.mp4 is that video's thumbnail)
//   src/races/<slug>/photos/*      my own photos
const dataGlobs = import.meta.glob<RaceData>('/src/races/*/race.json', {
	eager: true,
	import: 'default'
});

const imageGlobs = import.meta.glob<string>(
	'/src/races/*/{official,photos}/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,mp4,webm,MP4}',
	{ eager: true, as: 'url' }
);

const slugOf = (path: string) => path.split('/')[3];

const isPoster = (path: string) => /\.poster\.[a-z]+$/i.test(path);

const photosOf = (slug: string, kind: 'official' | 'photos'): Photo[] => {
	const files = Object.entries(imageGlobs).filter(([path]) =>
		path.startsWith(`/src/races/${slug}/${kind}/`)
	);
	const posterFor = (path: string) =>
		files.find(
			([other]) => isPoster(other) && other.startsWith(path.replace(/\.[a-z0-9]+$/i, '.poster.'))
		)?.[1];
	return files
		.filter(([path]) => !isPoster(path))
		.map(([path, url]) => {
			const video = /\.(mp4|webm)$/i.test(path);
			return {
				url,
				file: path.split('/').pop() as string,
				video,
				...(video ? { poster: posterFor(path) } : {})
			};
		})
		.sort((a, b) => a.file.localeCompare(b.file));
};

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

	return races.sort((a, b) => b.date.localeCompare(a.date));
};

/** The fastest official finish per distance, shortest distance first. */
export const personalBests = (races: Race[]): Effort[] => {
	const best = new Map<string, Effort>();
	for (const race of races) {
		const seconds = officialSeconds(race);
		if (seconds === undefined) continue;
		const current = best.get(race.distance.label);
		if (!current || seconds < current.seconds) {
			best.set(race.distance.label, {
				label: race.distance.label,
				km: race.distance.km,
				seconds,
				race
			});
		}
	}
	return [...best.values()].sort((a, b) => a.km - b.km);
};

export const loadRace = (slug: string) => loadRaces().find((race) => race.slug === slug);
