// Race data lives entirely in this repository (src/races/<slug>/race.json),
// so results, splits and photos stay available even if the original sources
// (results sites, Strava) disappear. Nothing here is fetched at runtime.

export interface Distance {
	/** Display name, e.g. "Half Marathon" or "10K". Also used to group personal bests. */
	label: string;
	km: number;
}

export interface Target {
	/** Target finish time, "h:mm:ss" or "mm:ss". */
	time?: string;
	/** Target pace per km, "m:ss". If only one of time/pace is set, the other is derived. */
	pace?: string;
}

export interface OfficialSplit {
	/** Checkpoint name, e.g. "5K" or "Halfway". */
	label: string;
	/** Distance of the checkpoint from the start, when the timer published it. */
	km?: number;
	/** Cumulative time at the checkpoint, "h:mm:ss" or "mm:ss". */
	time: string;
}

export interface Placement {
	place: number;
	of?: number;
}

export interface OfficialResult {
	/** Link to the official results page. Kept as a reference only; everything shown is copied here. */
	resultsUrl?: string;
	chipTime?: string;
	gunTime?: string;
	bib?: string;
	category?: string;
	overall?: Placement;
	gender?: Placement;
	categoryPlace?: Placement;
	splits?: OfficialSplit[];
}

export interface StravaSplit {
	/** Split length in km. 1 for every split except (usually) the last. */
	km: number;
	/** Elapsed time for this split only, "m:ss". */
	time: string;
	elevGain?: number;
	elevLoss?: number;
	avgHr?: number;
	cadence?: number;
}

export interface StravaActivity {
	url?: string;
	distanceKm?: number;
	movingTime?: string;
	elapsedTime?: string;
	elevationGain?: number;
	elevationLoss?: number;
	minElevation?: number;
	maxElevation?: number;
	avgHr?: number;
	maxHr?: number;
	cadence?: number;
	splits?: StravaSplit[];
	/** [km, elevation in meters] samples, generated from a GPX file by `npm run race:gpx`. */
	profile?: [number, number][];
	/** [lat, lon] samples, generated from a GPX file by `npm run race:gpx`. */
	route?: [number, number][];
}

export interface Photo {
	url: string;
	file: string;
	/** Short clips (e.g. the timing company's finish-line video) sit in the gallery with photos. */
	video: boolean;
	/** A still for a video's thumbnail, from "<name>.poster.jpg" beside "<name>.mp4". */
	poster?: string;
}

export interface RaceData {
	name: string;
	/** "YYYY-MM-DD" */
	date: string;
	location?: string;
	distance: Distance;
	eventUrl?: string;
	/** Upcoming races: show prominently at the top of the races page. */
	featured?: boolean;
	target?: Target;
	official?: OfficialResult;
	strava?: StravaActivity;
	/** The event photographers' gallery for my bib. Its photos are for sale, so only the link is kept. */
	officialPhotosUrl?: string;
}

export interface Race extends RaceData {
	slug: string;
	officialPhotos: Photo[];
	photos: Photo[];
}

/** An official finish time at one distance, used for personal bests. */
export interface Effort {
	label: string;
	km: number;
	seconds: number;
	race: Race;
}

/** Parses "h:mm:ss", "mm:ss" or "ss" into seconds. */
export const parseTime = (time: string): number =>
	time
		.trim()
		.split(':')
		.reduce((total, part) => total * 60 + Number(part), 0);

const pad = (n: number) => n.toString().padStart(2, '0');

/** Formats seconds as "h:mm:ss" (or "m:ss" when under an hour). */
export const formatTime = (seconds: number): string => {
	const total = Math.round(seconds);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

/** Formats a pace (seconds per km) as "m:ss". */
export const formatPace = (secondsPerKm: number): string => formatTime(secondsPerKm);

/** Formats a signed time difference, e.g. "−1:23" or "+0:12". */
export const formatDelta = (seconds: number): string =>
	`${seconds < 0 ? '−' : '+'}${formatTime(Math.abs(seconds))}`;

/** The time that represents the race result: official chip time, then gun time, then Strava. */
export const finishSeconds = (race: RaceData): number | undefined => {
	const time =
		race.official?.chipTime ??
		race.official?.gunTime ??
		race.strava?.elapsedTime ??
		race.strava?.movingTime;
	return time ? parseTime(time) : undefined;
};

export const isFinished = (race: RaceData) => finishSeconds(race) !== undefined;

/** The official result only (chip time, then gun time), never a Strava time. */
export const officialSeconds = (race: RaceData): number | undefined => {
	const time = race.official?.chipTime ?? race.official?.gunTime;
	return time ? parseTime(time) : undefined;
};

export const targetSeconds = (race: RaceData): number | undefined => {
	if (race.target?.time) return parseTime(race.target.time);
	if (race.target?.pace) return parseTime(race.target.pace) * race.distance.km;
	return undefined;
};

export const targetPace = (race: RaceData): number | undefined => {
	if (race.target?.pace) return parseTime(race.target.pace);
	const seconds = targetSeconds(race);
	return seconds ? seconds / race.distance.km : undefined;
};

export const formatDate = (date: string) =>
	new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});

export const formatPlacement = (p?: Placement) =>
	p ? (p.of ? `${p.place} / ${p.of}` : `${p.place}`) : undefined;

/** Shows a link by its site name, e.g. "4sport-live.com". */
export const linkLabel = (url: string) => new URL(url).hostname.replace(/^(www|my|gallery)\./, '');

// Colors follow the distance, never its position, so adding a race never repaints anything.
// Unknown distances take the next free slot, in order of distance.
const DISTANCE_SLOTS: Record<string, number> = {
	'5K': 0,
	'10K': 1,
	'15K': 2,
	'Half Marathon': 3,
	Marathon: 4
};

/** The CSS color for a distance label (see the --dist-* variables in app.css). */
export const distanceColor = (label: string, allLabels: string[]) => {
	const taken = new Set(Object.values(DISTANCE_SLOTS));
	const free = [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => !taken.has(i));
	const extra = allLabels.filter((l) => !(l in DISTANCE_SLOTS));
	const slot = DISTANCE_SLOTS[label] ?? free[extra.indexOf(label) % free.length];
	return `var(--dist-${slot})`;
};
