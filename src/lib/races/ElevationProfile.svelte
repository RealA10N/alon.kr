<script lang="ts">
	export let profile: [number, number][];

	const width = 600;
	const height = 120;
	const pad = 4;

	$: maxKm = profile[profile.length - 1][0];
	$: elevations = profile.map(([, ele]) => ele);
	$: minEle = Math.min(...elevations);
	$: maxEle = Math.max(...elevations);
	// Avoid a flat course looking dramatic: show at least 40m of vertical range.
	$: range = Math.max(maxEle - minEle, 40);

	$: x = (km: number) => (km / maxKm) * width;
	$: y = (ele: number) => height - pad - ((ele - minEle) / range) * (height - 2 * pad);

	$: line = profile.map(([km, ele]) => `${x(km).toFixed(1)},${y(ele).toFixed(1)}`).join(' ');
	$: area = `0,${height} ${line} ${width},${height}`;
</script>

<figure class="my-4">
	<svg viewBox="0 0 {width} {height}" class="w-full h-auto" preserveAspectRatio="none" role="img">
		<title>Elevation profile, {Math.round(minEle)}m to {Math.round(maxEle)}m</title>
		<polygon points={area} class="fill-zinc-300 dark:fill-zinc-700" />
		<polyline
			points={line}
			fill="none"
			vector-effect="non-scaling-stroke"
			class="stroke-red-500"
			stroke-width="2"
		/>
	</svg>
	<figcaption class="flex justify-between text-sm text-zinc-500 tabular-nums">
		<span>0 km</span>
		<span>Elevation {Math.round(minEle)}–{Math.round(maxEle)} m</span>
		<span>{maxKm.toFixed(1)} km</span>
	</figcaption>
</figure>
