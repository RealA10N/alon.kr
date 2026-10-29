<script lang="ts">
	// A plain outline of the route, drawn from the stored GPS samples.
	// No map tiles, so nothing depends on an external service.
	export let route: [number, number][];

	const size = 300;
	const pad = 12;

	$: lats = route.map(([lat]) => lat);
	$: lons = route.map(([, lon]) => lon);
	$: midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
	$: lonScale = Math.cos((midLat * Math.PI) / 180);
	$: spanX = (Math.max(...lons) - Math.min(...lons)) * lonScale;
	$: spanY = Math.max(...lats) - Math.min(...lats);
	$: scale = (size - 2 * pad) / Math.max(spanX, spanY);
	$: offsetX = (size - spanX * scale) / 2;
	$: offsetY = (size - spanY * scale) / 2;

	$: project = ([lat, lon]: [number, number]) => [
		offsetX + (lon - Math.min(...lons)) * lonScale * scale,
		offsetY + (Math.max(...lats) - lat) * scale
	];

	$: points = route.map((p) => project(p));
	$: line = points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
	$: start = points[0];
	$: finish = points[points.length - 1];
</script>

<svg viewBox="0 0 {size} {size}" class="w-full h-auto max-w-[14rem] sm:max-w-xs mx-auto" role="img">
	<title>Route outline</title>
	<polyline
		points={line}
		fill="none"
		class="stroke-zinc-700 dark:stroke-zinc-300"
		stroke-width="3"
		stroke-linejoin="round"
		stroke-linecap="round"
	/>
	<circle cx={start[0]} cy={start[1]} r="6" class="fill-green-600" />
	<circle cx={finish[0]} cy={finish[1]} r="6" class="fill-red-500" />
</svg>
