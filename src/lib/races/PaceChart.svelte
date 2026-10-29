<script lang="ts" context="module">
	export type Point = {
		label: string;
		km: number;
		seconds: number;
		source: 'Official' | 'Strava';
		name: string;
		slug: string;
		year: number;
		isPersonalBest: boolean;
	};
</script>

<script lang="ts">
	import { formatPace, formatTime } from './race';

	// Pace by distance: one point per effort, colored by year on a one-hue ordinal ramp
	// (older is fainter). Filled points are official results, hollow ones are Strava efforts.
	export let points: Point[];

	// Four steps of one blue ramp, from oldest to newest year (colors are set in the style block).
	const STEPS = 4;

	let width = 0;
	let hovered: Point | null = null;

	const pad = { top: 24, right: 64, bottom: 30, left: 48 };
	const height = 240;

	$: years = [...new Set(points.map((p) => p.year))].sort();
	// Past four years, the oldest fold into the first step so adjacent steps stay distinct.
	$: slotOf = (year: number) => Math.max(0, STEPS - (years.length - years.indexOf(year)));
	$: legend = years.slice(-STEPS).map((year, i, shown) => ({
		label: i === 0 && years.length > shown.length ? `≤ ${year}` : `${year}`,
		slot: slotOf(year)
	}));

	$: pace = (p: Point) => p.seconds / p.km;
	$: maxKm = Math.max(...points.map((p) => p.km));
	$: kmTicks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45].filter((km) => km <= maxKm + 1);
	$: paceMin = Math.floor(Math.min(...points.map(pace)) / 15) * 15 - 15;
	$: paceMax = Math.ceil(Math.max(...points.map(pace)) / 15) * 15 + 15;
	$: paceTicks = Array.from(
		{ length: Math.floor((paceMax - paceMin) / 15) + 1 },
		(_, i) => paceMin + i * 15
	).filter((_, i, all) => all.length <= 7 || i % 2 === 0);

	$: plotWidth = Math.max(width - pad.left - pad.right, 1);
	$: plotHeight = height - pad.top - pad.bottom;
	$: x = (km: number) => pad.left + (km / Math.max(...kmTicks, maxKm)) * plotWidth;
	// Faster is higher.
	$: y = (secondsPerKm: number) =>
		pad.top + ((secondsPerKm - paceMin) / (paceMax - paceMin || 1)) * plotHeight;

	// Draw personal bests last so they sit on top.
	$: ordered = [...points].sort((a, b) => Number(a.isPersonalBest) - Number(b.isPersonalBest));
	$: tooltipLeft = hovered ? Math.min(Math.max(x(hovered.km), 90), width - 90) : 0;
	$: tooltipTop = hovered ? y(pace(hovered)) + 12 : 0;
</script>

<figure class="pace-chart my-4 select-none">
	<ul class="flex flex-wrap gap-x-4 gap-y-1 m-0 mb-2 p-0 text-sm text-zinc-600 dark:text-zinc-400">
		{#each legend as entry}
			<li class="list-none m-0 flex items-center gap-1">
				<svg width="10" height="10" aria-hidden="true">
					<circle cx="5" cy="5" r="5" fill="var(--year-{entry.slot})" />
				</svg>
				{entry.label}
			</li>
		{/each}
		<li class="list-none m-0 flex items-center gap-1">
			<svg width="10" height="10" aria-hidden="true">
				<circle cx="5" cy="5" r="5" class="fill-zinc-500" />
			</svg>
			Official
		</li>
		<li class="list-none m-0 flex items-center gap-1">
			<svg width="10" height="10" aria-hidden="true">
				<circle cx="5" cy="5" r="4" fill="none" stroke-width="2" class="stroke-zinc-500" />
			</svg>
			Strava
		</li>
	</ul>

	<div class="relative" bind:clientWidth={width}>
		{#if width > 0 && points.length > 0}
			<svg {width} {height} role="img" aria-label="Pace by distance for every race and best effort">
				{#each paceTicks as tick}
					<line
						x1={pad.left}
						x2={pad.left + plotWidth}
						y1={y(tick)}
						y2={y(tick)}
						class="stroke-zinc-300 dark:stroke-zinc-700"
					/>
					<text x={pad.left - 6} y={y(tick) + 4} text-anchor="end" class="tick">
						{formatPace(tick)}
					</text>
				{/each}
				{#each kmTicks as km}
					<text x={x(km)} y={height - 10} text-anchor="middle" class="tick">{km}</text>
				{/each}
				<text x={pad.left - 6} y={height - 10} text-anchor="end" class="tick">km</text>
				<text x={pad.left - 6} y={10} text-anchor="end" class="tick">/km</text>

				{#each ordered as point}
					{@const cx = x(point.km)}
					{@const cy = y(pace(point))}
					<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
					<g
						tabindex="0"
						role="img"
						aria-label="{point.name}: {point.label} in {formatTime(point.seconds)}, {point.source}"
						on:pointerenter={() => (hovered = point)}
						on:pointerleave={() => (hovered = null)}
						on:focus={() => (hovered = point)}
						on:blur={() => (hovered = null)}
						class="outline-none cursor-pointer"
					>
						<!-- Hit target larger than the mark -->
						<circle {cx} {cy} r="12" fill="transparent" />
						{#if point.source === 'Official'}
							<circle
								{cx}
								{cy}
								r={hovered === point ? 7 : 6}
								stroke-width="2"
								fill="var(--year-{slotOf(point.year)})"
								class="stroke-zinc-100 dark:stroke-zinc-900"
							/>
						{:else}
							<circle
								{cx}
								{cy}
								r={hovered === point ? 6 : 5}
								stroke-width="2.5"
								stroke="var(--year-{slotOf(point.year)})"
								class="fill-zinc-100 dark:fill-zinc-900"
							/>
						{/if}
					</g>
					{#if point.isPersonalBest}
						<text x={cx + 10} y={cy + 4} class="label">{formatTime(point.seconds)}</text>
					{/if}
				{/each}
			</svg>

			{#if hovered}
				<div
					class="absolute -translate-x-1/2 pointer-events-none rounded-md border px-3 py-2 text-sm shadow-md tabular-nums whitespace-nowrap
						bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200"
					style="left: {tooltipLeft}px; top: {tooltipTop}px"
				>
					<div class="font-bold">{hovered.name}</div>
					<div>
						{hovered.label} · {formatTime(hovered.seconds)} · {formatPace(pace(hovered))} /km
					</div>
					<div class="text-zinc-500">
						{hovered.source}{hovered.isPersonalBest ? ' · Personal best' : ''}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</figure>

<style>
	.tick {
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		/* zinc-500 reads on both the light and dark surfaces */
		fill: #71717a;
	}
	.label {
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		fill: #3f3f46;
	}
	/* Ordinal steps validated with the dataviz validate_palette.js --ordinal check against the
	   site's zinc-100 (light) and zinc-900 (dark) surfaces. Light mode darkens toward the newest
	   year; dark mode brightens toward it. */
	.pace-chart {
		--year-0: #6da7ec;
		--year-1: #3987e5;
		--year-2: #1c5cab;
		--year-3: #0d366b;
	}
	@media (prefers-color-scheme: dark) {
		.label {
			fill: #d4d4d8;
		}
		.pace-chart {
			--year-0: #1c5cab;
			--year-1: #3987e5;
			--year-2: #6da7ec;
			--year-3: #9ec5f4;
		}
	}
</style>
