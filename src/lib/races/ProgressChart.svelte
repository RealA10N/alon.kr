<script lang="ts" context="module">
	export type Result = {
		slug: string;
		name: string;
		date: string;
		label: string;
		km: number;
		seconds: number;
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatDate, formatPace, formatTime } from './race';

	// Official results over time, one line per distance. Pace is the y-axis so every distance
	// shares one scale; faster is higher.
	export let results: Result[];

	// Colors follow the distance, never its position, so adding a race never repaints a line.
	// Slots are the dataviz reference categorical order; unknown distances take the next free slot.
	const SLOTS = 8;
	const FIXED: Record<string, number> = {
		'5K': 0,
		'10K': 1,
		'15K': 2,
		'Half Marathon': 3,
		Marathon: 4
	};

	let width = 0;
	let hidden = new Set<string>();
	let hovered: (Result & { x: number; y: number }) | null = null;

	const pad = { top: 24, right: 16, bottom: 30, left: 48 };
	const height = 260;

	$: rows = [...results].sort((a, b) => a.date.localeCompare(b.date));
	$: distances = [...new Map(rows.map((r) => [r.label, r.km])).entries()]
		.sort((a, b) => a[1] - b[1])
		.map(([label]) => label);
	$: slot = (() => {
		const taken = new Set(Object.values(FIXED));
		const extra = distances.filter((d) => !(d in FIXED));
		const free = Array.from({ length: SLOTS }, (_, i) => i).filter((i) => !taken.has(i));
		return (label: string) => FIXED[label] ?? free[extra.indexOf(label) % free.length];
	})();

	$: shown = rows.filter((r) => !hidden.has(r.label));
	$: years = rows.map((r) => Number(r.date.slice(0, 4)));
	$: firstYear = Math.min(...years);
	$: lastYear = Math.max(...years);
	$: t0 = Date.UTC(firstYear, 0, 1);
	$: t1 = Date.UTC(lastYear + 1, 0, 1);

	$: pace = (r: Result) => r.seconds / r.km;
	// Keep the scale fixed while toggling distances, so lines don't jump around.
	$: paces = rows.map(pace);
	$: paceMin = Math.floor(Math.min(...paces) / 15) * 15 - 15;
	$: paceMax = Math.ceil(Math.max(...paces) / 15) * 15 + 15;
	$: paceTicks = Array.from(
		{ length: Math.floor((paceMax - paceMin) / 15) + 1 },
		(_, i) => paceMin + i * 15
	);

	$: plotWidth = Math.max(width - pad.left - pad.right, 1);
	$: x = (date: string) =>
		pad.left + ((Date.parse(`${date}T00:00:00Z`) - t0) / (t1 - t0)) * plotWidth;
	$: xYear = (year: number) => pad.left + ((Date.UTC(year, 0, 1) - t0) / (t1 - t0)) * plotWidth;
	$: y = (secondsPerKm: number) =>
		pad.top +
		((secondsPerKm - paceMin) / (paceMax - paceMin || 1)) * (height - pad.top - pad.bottom);

	$: lines = distances
		.filter((d) => !hidden.has(d))
		.map((d) => ({
			label: d,
			points: shown.filter((r) => r.label === d).map((r) => ({ ...r, x: x(r.date), y: y(pace(r)) }))
		}));

	const toggle = (label: string) => {
		hidden.has(label) ? hidden.delete(label) : hidden.add(label);
		hidden = hidden;
		hovered = null;
	};

	$: tooltipLeft = hovered ? Math.min(Math.max(hovered.x, 100), width - 100) : 0;
</script>

<figure class="progress-chart my-4 select-none">
	<div class="flex flex-wrap gap-1 mb-2" role="group" aria-label="Distances">
		{#each distances as label}
			<button
				class="chip m-0 inline-flex items-center gap-1.5"
				class:opacity-40={hidden.has(label)}
				aria-pressed={!hidden.has(label)}
				on:click={() => toggle(label)}
			>
				<span
					class="inline-block w-2.5 h-2.5 rounded-full"
					style="background: var(--s{slot(label)})"
				/>
				{label}
			</button>
		{/each}
	</div>

	<div class="relative" bind:clientWidth={width}>
		{#if width > 0 && rows.length > 0}
			<svg {width} {height} role="img" aria-label="Pace of official race results over time">
				{#each paceTicks as tick, i}
					<line
						x1={pad.left}
						x2={pad.left + plotWidth}
						y1={y(tick)}
						y2={y(tick)}
						class="stroke-zinc-300 dark:stroke-zinc-700"
					/>
					{#if i % 2 === 0}
						<text x={pad.left - 6} y={y(tick) + 4} text-anchor="end" class="tick">
							{formatPace(tick)}
						</text>
					{/if}
				{/each}
				<text x={pad.left - 6} y={10} text-anchor="end" class="tick">/km</text>

				{#each Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i) as year}
					<line
						x1={xYear(year)}
						x2={xYear(year)}
						y1={pad.top}
						y2={height - pad.bottom}
						class="stroke-zinc-200 dark:stroke-zinc-800"
					/>
					<text
						x={(xYear(year) + xYear(year + 1)) / 2}
						y={height - 10}
						text-anchor="middle"
						class="tick"
					>
						{year}
					</text>
				{/each}

				{#each lines as line}
					{#if line.points.length > 1}
						<polyline
							points={line.points.map((p) => `${p.x},${p.y}`).join(' ')}
							fill="none"
							stroke="var(--s{slot(line.label)})"
							stroke-width="2"
							stroke-linejoin="round"
							stroke-linecap="round"
						/>
					{/if}
					{#each line.points as point}
						<g
							tabindex="0"
							role="link"
							aria-label="{point.name}: {formatTime(point.seconds)}, {formatPace(
								pace(point)
							)} per km"
							class="outline-none cursor-pointer"
							on:pointerenter={() => (hovered = point)}
							on:pointerleave={() => (hovered = null)}
							on:focus={() => (hovered = point)}
							on:blur={() => (hovered = null)}
							on:click={() => goto(`/races/${point.slug}`)}
							on:keydown={(event) => event.key === 'Enter' && goto(`/races/${point.slug}`)}
						>
							<!-- Hit target larger than the mark -->
							<circle cx={point.x} cy={point.y} r="12" fill="transparent" />
							<circle
								cx={point.x}
								cy={point.y}
								r={hovered?.slug === point.slug ? 6.5 : 5}
								stroke-width="2"
								fill="var(--s{slot(line.label)})"
								class="stroke-zinc-100 dark:stroke-zinc-900"
							/>
						</g>
					{/each}
				{/each}
			</svg>

			{#if hovered}
				<div
					class="absolute -translate-x-1/2 pointer-events-none rounded-md border px-3 py-2 text-sm shadow-md tabular-nums whitespace-nowrap
						bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200"
					style="left: {tooltipLeft}px; top: {hovered.y + 14}px"
				>
					<div class="font-bold">{hovered.name}</div>
					<div>{formatTime(hovered.seconds)} · {formatPace(pace(hovered))} /km</div>
					<div class="text-zinc-500">{formatDate(hovered.date)}</div>
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
	.chip {
		border-radius: 9999px;
	}
	/* Categorical slots from the dataviz reference palette (validated for lines in both modes). */
	.progress-chart {
		--s0: #2a78d6;
		--s1: #eb6834;
		--s2: #1baf7a;
		--s3: #eda100;
		--s4: #e87ba4;
		--s5: #008300;
		--s6: #6250d6;
		--s7: #e34948;
	}
	@media (prefers-color-scheme: dark) {
		.progress-chart {
			--s0: #3987e5;
			--s1: #d95926;
			--s2: #199e70;
			--s3: #c98500;
			--s4: #d55181;
			--s5: #008300;
			--s6: #9085e9;
			--s7: #e66767;
		}
	}
</style>
