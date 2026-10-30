<script lang="ts">
	import { formatPace, parseTime, type StravaSplit } from './race';

	// Pace, heart rate and elevation per km as three strips on one shared distance axis.
	// Each strip has its own y-scale (never two scales on one plot); one crosshair reads all three.
	export let splits: StravaSplit[];

	let width = 0;
	let hovered: number | null = null;

	const left = 48;
	const right = 8;
	const stripHeight = 84;
	const gap = 28;
	const axisHeight = 22;
	// Room above the first strip for its title.
	const padTop = 22;

	$: rows = splits.reduce<
		{ index: number; start: number; end: number; pace: number; hr?: number; elev?: number }[]
	>((acc, split, index) => {
		const start = acc.length ? acc[acc.length - 1].end : 0;
		const hasElev = split.elevGain !== undefined || split.elevLoss !== undefined;
		acc.push({
			index,
			start,
			end: start + split.km,
			pace: parseTime(split.time) / split.km,
			hr: split.avgHr,
			elev: hasElev ? (split.elevGain ?? 0) - (split.elevLoss ?? 0) : undefined
		});
		return acc;
	}, []);
	$: total = rows.length ? rows[rows.length - 1].end : 1;
	$: hasHr = rows.some((row) => row.hr !== undefined);
	$: hasElev = rows.some((row) => row.elev !== undefined);
	type Strip = 'pace' | 'hr' | 'elev';
	let strips: Strip[] = [];
	$: strips = ['pace', ...(hasHr ? ['hr' as const] : []), ...(hasElev ? ['elev' as const] : [])];
	$: height = padTop + strips.length * (stripHeight + gap) - gap + axisHeight;
	$: plotWidth = Math.max(width - left - right, 1);

	$: x = (km: number) => left + (km / total) * plotWidth;
	$: top = (strip: Strip) => padTop + strips.indexOf(strip) * (stripHeight + gap);

	// A short final split (e.g. the last 0.03 km) is too noisy to set the pace scale.
	$: fullRows = rows.filter((row) => row.end - row.start >= 0.5);
	$: paceMin = Math.floor(Math.min(...fullRows.map((r) => r.pace)) / 10) * 10;
	$: paceMax = Math.ceil(Math.max(...fullRows.map((r) => r.pace)) / 10) * 10;
	// Faster is higher: the fastest pace sits at the top of the strip.
	$: yPace = (pace: number) =>
		top('pace') +
		Math.min(Math.max((pace - paceMin) / (paceMax - paceMin || 1), 0), 1) * stripHeight;

	$: hrs = rows.flatMap((r) => (r.hr !== undefined ? [r.hr] : []));
	$: hrMin = Math.floor((Math.min(...hrs) - 2) / 5) * 5;
	$: hrMax = Math.ceil((Math.max(...hrs) + 2) / 5) * 5;
	$: yHr = (hr: number) =>
		top('hr') + stripHeight - ((hr - hrMin) / (hrMax - hrMin || 1)) * stripHeight;

	$: elevs = rows.flatMap((r) => (r.elev !== undefined ? [r.elev] : []));
	$: elevMax = Math.max(5, ...elevs.map(Math.abs));
	$: yElev = (elev: number) => top('elev') + stripHeight / 2 - (elev / elevMax) * (stripHeight / 2);

	$: center = (row: (typeof rows)[number]) => x((row.start + row.end) / 2);
	$: paceLine = rows.map((r) => `${center(r)},${yPace(r.pace)}`).join(' ');
	$: hrLine = rows
		.filter((r) => r.hr !== undefined)
		.map((r) => `${center(r)},${yHr(r.hr as number)}`)
		.join(' ');

	$: kmTicks = Array.from({ length: Math.floor(total) + 1 }, (_, i) => i).filter(
		(km) => km % (total > 25 ? 5 : total > 12 ? 2 : 1) === 0
	);

	const titles = { pace: 'Pace (/km)', hr: 'Heart rate (bpm)', elev: 'Elevation (m)' };

	const pick = (event: PointerEvent) => {
		const box = (event.currentTarget as SVGElement).getBoundingClientRect();
		const km = ((event.clientX - box.left - left) / plotWidth) * total;
		const row =
			rows.find((r) => km >= r.start && km < r.end) ?? (km >= total ? rows[rows.length - 1] : null);
		hovered = row ? row.index : null;
	};

	const step = (event: KeyboardEvent) => {
		if (event.key === 'ArrowRight') hovered = Math.min((hovered ?? -1) + 1, rows.length - 1);
		else if (event.key === 'ArrowLeft') hovered = Math.max((hovered ?? rows.length) - 1, 0);
		else return;
		event.preventDefault();
	};

	$: active = hovered !== null ? rows[hovered] : null;
	// The tooltip sits beside the hovered band, on whichever side has room, so it never covers it.
	const tooltipWidth = 170;
	$: tooltipOnRight = active ? x(active.end) + 8 + tooltipWidth <= width : true;
	$: tooltipLeft = active ? (tooltipOnRight ? x(active.end) + 8 : x(active.start) - 8) : 0;
	const kmLabel = (row: { start: number; end: number }) =>
		row.end - row.start === 1 ? `Km ${row.end}` : `Km ${row.end.toFixed(2)}`;
</script>

<figure class="relative my-4 select-none" bind:clientWidth={width}>
	{#if width > 0 && rows.length > 0}
		<!-- svelte-ignore a11y-no-noninteractive-tabindex a11y-no-noninteractive-element-interactions -->
		<svg
			{width}
			{height}
			role="img"
			aria-label="Pace, heart rate and elevation for each kilometer. Use the arrow keys to read each kilometer."
			tabindex="0"
			class="block touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
			on:pointermove={pick}
			on:pointerdown={pick}
			on:pointerleave={() => (hovered = null)}
			on:keydown={step}
			on:blur={() => (hovered = null)}
		>
			<!-- Hovered kilometer band, across all strips, drawn first so it stays behind the titles and marks -->
			{#if active}
				<rect
					x={x(active.start)}
					y={padTop}
					width={Math.max(x(active.end) - x(active.start), 1)}
					height={height - axisHeight - padTop}
					class="fill-zinc-200 dark:fill-zinc-800"
				/>
			{/if}

			{#each strips as strip}
				{@const y0 = top(strip)}
				<text x={left} y={y0 - 8} class="fill-zinc-700 dark:fill-zinc-300 text-[12px] font-bold">
					{titles[strip]}
				</text>
				<!-- Strip frame: baseline and top hairlines -->
				<line
					x1={left}
					x2={left + plotWidth}
					y1={y0}
					y2={y0}
					class="stroke-zinc-300 dark:stroke-zinc-700"
				/>
				<line
					x1={left}
					x2={left + plotWidth}
					y1={y0 + stripHeight}
					y2={y0 + stripHeight}
					class="stroke-zinc-300 dark:stroke-zinc-700"
				/>
			{/each}

			<!-- Pace -->
			<text x={left - 6} y={top('pace') + 4} text-anchor="end" class="tick"
				>{formatPace(paceMin)}</text
			>
			<text x={left - 6} y={top('pace') + stripHeight + 4} text-anchor="end" class="tick">
				{formatPace(paceMax)}
			</text>
			<polyline
				points={paceLine}
				fill="none"
				stroke-width="2"
				stroke-linejoin="round"
				stroke-linecap="round"
				class="stroke-red-500"
			/>
			{#each rows as row}
				<circle
					cx={center(row)}
					cy={yPace(row.pace)}
					r={hovered === row.index ? 5 : 4}
					stroke-width="2"
					class="fill-red-500 stroke-zinc-100 dark:stroke-zinc-900"
				/>
			{/each}

			<!-- Heart rate -->
			{#if hasHr}
				<text x={left - 6} y={top('hr') + 4} text-anchor="end" class="tick">{hrMax}</text>
				<text x={left - 6} y={top('hr') + stripHeight + 4} text-anchor="end" class="tick"
					>{hrMin}</text
				>
				<polyline
					points={hrLine}
					fill="none"
					stroke-width="2"
					stroke-linejoin="round"
					stroke-linecap="round"
					class="stroke-zinc-600 dark:stroke-zinc-300"
				/>
				{#each rows.filter((r) => r.hr !== undefined) as row}
					<circle
						cx={center(row)}
						cy={yHr(row.hr ?? 0)}
						r={hovered === row.index ? 5 : 4}
						stroke-width="2"
						class="fill-zinc-600 dark:fill-zinc-300 stroke-zinc-100 dark:stroke-zinc-900"
					/>
				{/each}
			{/if}

			<!-- Elevation: net change per km, up from or down to the zero line -->
			{#if hasElev}
				{@const zero = top('elev') + stripHeight / 2}
				<text x={left - 6} y={top('elev') + 4} text-anchor="end" class="tick">+{elevMax}</text>
				<text x={left - 6} y={zero + 4} text-anchor="end" class="tick">0</text>
				<text x={left - 6} y={top('elev') + stripHeight + 4} text-anchor="end" class="tick">
					−{elevMax}
				</text>
				<line
					x1={left}
					x2={left + plotWidth}
					y1={zero}
					y2={zero}
					class="stroke-zinc-400 dark:stroke-zinc-600"
				/>
				{#each rows.filter((r) => r.elev !== undefined) as row}
					{@const elev = row.elev ?? 0}
					{@const bandWidth = x(row.end) - x(row.start)}
					{@const barWidth = Math.max(Math.min(bandWidth - 2, 24), 1)}
					<rect
						x={center(row) - barWidth / 2}
						y={Math.min(yElev(elev), zero)}
						width={barWidth}
						height={Math.max(Math.abs(yElev(elev) - zero), 1)}
						rx="2"
						class="fill-zinc-400 dark:fill-zinc-500"
					/>
				{/each}
			{/if}

			<!-- Shared distance axis -->
			{#each kmTicks as km}
				<text x={x(km)} y={height - 6} text-anchor="middle" class="tick">{km}</text>
			{/each}
			<text x={left - 6} y={height - 6} text-anchor="end" class="tick">km</text>
		</svg>

		{#if active}
			<div
				class="absolute pointer-events-none rounded-md border px-3 py-2 text-sm shadow-md tabular-nums whitespace-nowrap
					bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-200"
				class:-translate-x-full={!tooltipOnRight}
				style="left: {tooltipLeft}px; top: {padTop}px"
			>
				<div class="font-bold">{kmLabel(active)}</div>
				<div>
					<span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />Pace {formatPace(
						active.pace
					)} /km
				</div>
				{#if active.hr !== undefined}
					<div>
						<span class="inline-block w-2 h-2 rounded-full bg-zinc-600 dark:bg-zinc-300 mr-1" />HR {active.hr}
						bpm
					</div>
				{/if}
				{#if active.elev !== undefined}
					<div>
						<span
							class="inline-block w-2 h-2 rounded-sm bg-zinc-400 dark:bg-zinc-500 mr-1"
						/>Elevation
						{active.elev > 0 ? '+' : active.elev < 0 ? '−' : ''}{Math.abs(active.elev)} m
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</figure>

<style>
	.tick {
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		/* zinc-500 reads on both the light and dark surfaces */
		fill: #71717a;
	}
</style>
