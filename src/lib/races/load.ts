import { finishSeconds, isFinished, type Photo, type Race, type RaceData } from './race';

// Everything is bundled at build time: each race is a folder under src/races/
//   src/races/<slug>/race.json     race details, results, splits, Strava stats
//   src/races/<slug>/official/*    photos by the event photographers
//   src/races/<slug>/photos/*      my own photos
//   src/races/<slug>/report.md     optional race report
const dataGlobs = import.meta.glob<RaceData>('/src/races/*/race.json', {
	eager: true,
	import: 'default'
});

const imageGlobs = import.meta.glob<string>(
	'/src/races/*/{official,photos}/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}',
	{ eager: true, as: 'url' }
);

const reportGlobs = import.meta.glob('/src/races/*/report.md');

const slugOf = (path: string) => path.split('/')[3];

const photosOf = (slug: string, kind: 'official' | 'photos', data: RaceData): Photo[] =>
	Object.entries(imageGlobs)
		.filter(([path]) => path.startsWith(`/src/races/${slug}/${kind}/`))
		.map(([path, url]) => {
			const file = path.split('/').pop() as string;
			return { url, file, caption: data.captions?.[file] };
		})
		.sort((a, b) => a.file.localeCompare(b.file));

export const loadRaces = (): Race[] => {
	const races: Race[] = Object.entries(dataGlobs).map(([path, data]) => {
		const slug = slugOf(path);
		return {
			...data,
			slug,
			officialPhotos: photosOf(slug, 'official', data),
			photos: photosOf(slug, 'photos', data),
			hasReport: `/src/races/${slug}/report.md` in reportGlobs
		};
	});

	// Mark the fastest finish for each distance.
	const best = new Map<string, Race>();
	for (const race of races.filter(isFinished)) {
		const current = best.get(race.distance.label);
		if (!current || (finishSeconds(race) as number) < (finishSeconds(current) as number)) {
			best.set(race.distance.label, race);
		}
	}
	for (const race of best.values()) race.isPersonalBest = true;

	return races.sort((a, b) => b.date.localeCompare(a.date));
};

export const loadRace = (slug: string) => loadRaces().find((race) => race.slug === slug);
