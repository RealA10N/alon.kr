// Archives a Strava (or any watch) GPX export into a race's race.json:
// per-km splits, elevation profile, route outline and summary stats.
//
//   npm run race:gpx -- <slug> [path/to/activity.gpx] [--force]
//
// The GPX defaults to src/races/<slug>/activity.gpx, and is worth committing
// next to race.json as the raw record. Summary stats you entered by hand
// (e.g. copied from Strava, which uses its own smoothing) are kept unless
// --force is passed; splits, profile and route are always regenerated.

import fs from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';

const args = process.argv.slice(2);
const force = args.includes('--force');
const [slug, gpxArg] = args.filter((arg) => !arg.startsWith('--'));

if (!slug) {
	console.error('usage: npm run race:gpx -- <slug> [activity.gpx] [--force]');
	process.exit(1);
}

const raceDir = path.join('src', 'races', slug);
const racePath = path.join(raceDir, 'race.json');
const gpxPath = gpxArg ?? path.join(raceDir, 'activity.gpx');

const tag = (xml, name) => {
	const match = xml.match(new RegExp(`<(?:\\w+:)?${name}>([^<]*)</(?:\\w+:)?${name}>`));
	return match ? Number(match[1]) : undefined;
};

const parseGpx = (xml) =>
	[...xml.matchAll(/<trkpt\s+([^>]*)>([\s\S]*?)<\/trkpt>/g)].map(([, attrs, body]) => {
		const lat = Number(attrs.match(/lat="([^"]+)"/)[1]);
		const lon = Number(attrs.match(/lon="([^"]+)"/)[1]);
		const time = body.match(/<time>([^<]+)<\/time>/);
		return {
			lat,
			lon,
			ele: tag(body, 'ele'),
			time: time ? Date.parse(time[1]) / 1000 : undefined,
			hr: tag(body, 'hr'),
			cad: tag(body, 'cad')
		};
	});

const haversine = (a, b) => {
	const rad = Math.PI / 180;
	const dLat = (b.lat - a.lat) * rad;
	const dLon = (b.lon - a.lon) * rad;
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
	return 2 * 6371000 * Math.asin(Math.sqrt(h));
};

const formatTime = (seconds) => {
	const total = Math.round(seconds);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = (total % 60).toString().padStart(2, '0');
	return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s}` : `${m}:${s}`;
};

const average = (values) =>
	values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : undefined;

const points = parseGpx(fs.readFileSync(gpxPath, 'utf8'));
if (points.length < 2 || points.some((p) => p.time === undefined)) {
	console.error(`${gpxPath}: expected a GPX track with timestamps`);
	process.exit(1);
}

// Cumulative distance, and elevation smoothed over a few samples to drop GPS/barometer noise.
let distance = 0;
points.forEach((point, i) => {
	if (i > 0) distance += haversine(points[i - 1], point);
	point.dist = distance;
});
points.forEach((point, i) => {
	const window = points.slice(Math.max(0, i - 2), i + 3).filter((p) => p.ele !== undefined);
	point.smoothEle = window.length
		? window.reduce((sum, p) => sum + p.ele, 0) / window.length
		: undefined;
});

const timeAt = (meters) => {
	const i = points.findIndex((p) => p.dist >= meters);
	if (i <= 0) return points[i < 0 ? points.length - 1 : 0].time;
	const [a, b] = [points[i - 1], points[i]];
	return a.time + ((meters - a.dist) / (b.dist - a.dist || 1)) * (b.time - a.time);
};

const climb = (segment) => {
	let gain = 0;
	let loss = 0;
	segment.forEach((p, i) => {
		if (i === 0 || p.smoothEle === undefined || segment[i - 1].smoothEle === undefined) return;
		const delta = p.smoothEle - segment[i - 1].smoothEle;
		if (delta > 0) gain += delta;
		else loss -= delta;
	});
	return { gain: Math.round(gain), loss: Math.round(loss) };
};

const splits = [];
for (let start = 0; start < distance - 50; start += 1000) {
	const end = Math.min(start + 1000, distance);
	const segment = points.filter((p) => p.dist >= start && p.dist <= end);
	const { gain, loss } = climb(segment);
	const cadences = segment.map((p) => p.cad).filter((c) => c !== undefined);
	splits.push({
		km: Number(((end - start) / 1000).toFixed(2)),
		time: formatTime(timeAt(end) - timeAt(start)),
		elevGain: gain,
		elevLoss: loss,
		avgHr: average(segment.map((p) => p.hr).filter((hr) => hr !== undefined)),
		// GPX cadence is per leg; Strava shows steps per minute for runs.
		cadence: cadences.length ? average(cadences) * 2 : undefined
	});
}

const sample = (count) => {
	const step = Math.max(1, Math.floor(points.length / count));
	return points.filter((_, i) => i % step === 0 || i === points.length - 1);
};

const elevations = points.map((p) => p.smoothEle).filter((e) => e !== undefined);
const hrs = points.map((p) => p.hr).filter((hr) => hr !== undefined);
const cads = points.map((p) => p.cad).filter((c) => c !== undefined);
const totalClimb = climb(points);
const movingSeconds = points.reduce((sum, p, i) => {
	if (i === 0) return 0;
	const dt = p.time - points[i - 1].time;
	return sum + (dt > 0 && (p.dist - points[i - 1].dist) / dt > 1 ? dt : 0);
}, 0);

const summary = {
	distanceKm: Number((distance / 1000).toFixed(2)),
	movingTime: formatTime(movingSeconds),
	elapsedTime: formatTime(points[points.length - 1].time - points[0].time),
	elevationGain: elevations.length ? totalClimb.gain : undefined,
	elevationLoss: elevations.length ? totalClimb.loss : undefined,
	minElevation: elevations.length ? Math.round(Math.min(...elevations)) : undefined,
	maxElevation: elevations.length ? Math.round(Math.max(...elevations)) : undefined,
	avgHr: average(hrs),
	maxHr: hrs.length ? Math.max(...hrs) : undefined,
	cadence: cads.length ? average(cads) * 2 : undefined
};

const race = JSON.parse(fs.readFileSync(racePath, 'utf8'));
const strava = race.strava ?? {};
for (const [key, value] of Object.entries(summary)) {
	if (value !== undefined && (force || strava[key] === undefined)) strava[key] = value;
}
strava.splits = splits;
strava.profile = elevations.length
	? sample(200).map((p) => [Number((p.dist / 1000).toFixed(2)), Math.round(p.smoothEle)])
	: undefined;
strava.route = sample(300).map((p) => [Number(p.lat.toFixed(5)), Number(p.lon.toFixed(5))]);
race.strava = strava;

const options = (await prettier.resolveConfig(racePath)) ?? {};
fs.writeFileSync(racePath, prettier.format(JSON.stringify(race), { ...options, parser: 'json' }));

console.log(
	`${racePath}: ${splits.length} splits, ${summary.distanceKm} km, ${summary.elapsedTime} elapsed`
);
