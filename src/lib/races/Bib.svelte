<script lang="ts">
	import type { Race } from './race';

	// A digital copy of the paper bib, drawn as SVG on an A5 sheet (210 × 148 mm, 1 unit = 1 mm).
	// Races with a `bibDesign` get their real colors, title and markers; every other race gets
	// the same layout in grey, outlined with a dashed line, as a placeholder.
	export let race: Race;

	$: design = race.bibDesign;
	$: placeholder = !design;
	$: number = race.official?.bib ?? '—';
	$: km = race.distance.km;
	$: distance = design?.distance ?? (Number.isInteger(km) ? `${km}` : km.toFixed(1));
	$: band = design?.color ?? '#a1a1aa';
	$: titleColor = design?.titleColor ?? '#52525b';
	$: title = design?.title ?? [race.name];
	$: rtl = design?.titleDir === 'rtl';
	$: marker = design?.marker;

	const maskId = `bib-holes-${Math.random().toString(36).slice(2)}`;

	// Bib fonts are tall and narrow; squeezing a bold sans to a fixed width per character
	// gives the same look whatever font the browser picks.
	const NUMBER_FONT = "'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
	const width = (text: string, perChar: number, max: number) =>
		Math.min(text.length * perChar, max);

	const holes = [
		[11, 10],
		[199, 10],
		[11, 138],
		[199, 138]
	];
	const markerFrames = [9, 153];
</script>

<figure class="my-4 mx-auto max-w-xl">
	<svg
		viewBox="0 0 210 148"
		role="img"
		aria-label="{placeholder ? 'Placeholder bib' : 'Bib'} {number}, {race.name}"
		class="w-full h-auto drop-shadow-md"
		style="font-family: {NUMBER_FONT}"
	>
		<defs>
			<mask id={maskId}>
				<rect width="210" height="148" fill="white" />
				{#each holes as [cx, cy]}<circle {cx} {cy} r="1.8" fill="black" />{/each}
			</mask>
		</defs>

		<!-- The sheet, with the four safety-pin holes punched through. -->
		<rect
			width="210"
			height="148"
			rx="2"
			fill="#fbfbf8"
			mask="url(#{maskId})"
			stroke={placeholder ? '#a1a1aa' : 'none'}
			stroke-width="0.6"
			stroke-dasharray={placeholder ? '3 2' : undefined}
		/>

		<!-- Event title, with a crescent moon for night runs. -->
		{#if design?.moon}
			<!-- Opens to the upper right, where the stars are. -->
			<mask id="{maskId}-moon">
				<circle cx="125" cy="24" r="11.5" fill="white" />
				<circle cx="130.5" cy="19" r="10" fill="black" />
			</mask>
			<circle cx="125" cy="24" r="11.5" fill={titleColor} mask="url(#{maskId}-moon)" />
			<g fill={titleColor}>
				<circle cx="127" cy="17" r="0.6" />
				<circle cx="132" cy="22" r="0.45" />
				<circle cx="131" cy="15" r="0.4" />
			</g>
		{/if}
		<g
			fill={titleColor}
			font-weight="700"
			direction={rtl ? 'rtl' : 'ltr'}
			text-anchor={rtl ? 'end' : 'middle'}
		>
			{#each title as line, i}
				<text
					x={rtl ? 76 : 105}
					y={(rtl ? 19.5 : title.length === 1 ? 27 : 20) + i * 8}
					font-size={rtl ? 7.4 : 9}
					font-family="'Heebo', 'Arial Hebrew', Arial, sans-serif">{line}</text
				>
			{/each}
		</g>

		<!-- The band with the number and a photo-tagging marker on each side. -->
		<rect x="5" y="39" width="200" height="58" fill={band} />
		{#each markerFrames as x}
			<rect {x} y="43" width="48" height="50" fill="#fbfbf8" />
			{#if marker}
				<rect x={x + 6} y="46" width="36" height="36" fill={marker.palette.K ?? '#232326'} />
				{#each marker.grid as row, r}
					{#each row.split('') as cell, c}
						<rect
							x={x + 12 + c * (24 / row.length)}
							y={51 + r * (26 / marker.grid.length)}
							width={24 / row.length + 0.05}
							height={26 / marker.grid.length + 0.05}
							fill={marker.palette[cell]}
						/>
					{/each}
				{/each}
				{#if marker.code}
					<text x={x + 24} y="89.5" font-size="2.8" fill="#c4c4c4" text-anchor="middle"
						>{marker.code}</text
					>
				{/if}
			{:else}
				<rect
					x={x + 6}
					y="46"
					width="36"
					height="36"
					fill="none"
					stroke="#a1a1aa"
					stroke-width="0.6"
					stroke-dasharray="2 1.5"
				/>
			{/if}
		{/each}
		<text
			x="105"
			y="87"
			font-size="54"
			font-weight="700"
			fill="#fbfbf8"
			text-anchor="middle"
			textLength={width(number, 16, 66)}
			lengthAdjust="spacingAndGlyphs">{number}</text
		>

		<!-- Name field and distance. -->
		{#if design?.name}
			<text x="105" y="121" font-size="9" fill="#26262a" text-anchor="middle">{design.name}</text>
		{/if}
		<text
			x="178"
			y="125"
			font-size="34"
			font-weight="700"
			fill="#26262a"
			text-anchor="middle"
			textLength={width(distance, 13.5, 40)}
			lengthAdjust="spacingAndGlyphs">{distance}</text
		>
		<rect x="163" y="127.5" width="30" height="7" rx="1.5" fill="#26262a" />
		<text x="178" y="133" font-size="5.5" font-weight="700" fill="#fbfbf8" text-anchor="middle"
			>KM</text
		>
	</svg>
	{#if placeholder}
		<figcaption class="text-sm text-center mt-2">
			Placeholder: no digital copy of this bib yet.
		</figcaption>
	{/if}
</figure>
