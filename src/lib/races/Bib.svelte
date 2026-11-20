<script lang="ts">
	import type { Race } from './race';

	// A digital copy of the paper bib: src/races/<slug>/bib.svg, drawn on an A5 sheet
	// (210 × 148, 1 unit = 1 mm). Races without one get a grey placeholder with the same
	// layout, filled in with the bib number and distance.
	export let race: Race;

	$: number = race.official?.bib ?? '—';
	$: km = race.distance.km;
	$: distance = Number.isInteger(km) ? `${km}` : km.toFixed(1);

	// Bib fonts are tall and narrow; squeezing a bold sans to a fixed width per character
	// gives that look whatever font the browser picks.
	const FONT = "'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
	const width = (text: string, perChar: number, max: number) =>
		Math.min(text.length * perChar, max);

	const maskId = `bib-holes-${Math.random().toString(36).slice(2)}`;
	const holes = [
		[10.2, 9.2],
		[198.2, 8.2],
		[12.3, 137.9],
		[199.5, 136.3]
	];
	const frames = [6.4, 153.8];
</script>

<figure class="my-4 mx-auto max-w-xl">
	{#if race.bibImage}
		<img
			src={race.bibImage}
			alt="Bib {number}, {race.name}"
			width="210"
			height="148"
			class="w-full h-auto drop-shadow-md"
		/>
	{:else}
		<svg
			viewBox="0 0 210 148"
			role="img"
			aria-label="Placeholder bib {number}, {race.name}"
			class="w-full h-auto drop-shadow-md"
			style="font-family: {FONT}"
		>
			<defs>
				<mask id={maskId}>
					<rect width="210" height="148" fill="white" />
					{#each holes as [cx, cy]}<circle {cx} {cy} r="1.95" fill="black" />{/each}
				</mask>
			</defs>
			<rect
				width="210"
				height="148"
				fill="#fbfbf8"
				mask="url(#{maskId})"
				stroke="#a1a1aa"
				stroke-width="0.6"
				stroke-dasharray="3 2"
			/>
			<text x="105" y="25" font-size="9" font-weight="700" fill="#52525b" text-anchor="middle"
				>{race.name}</text
			>
			<rect x="3.05" y="39.8" width="202" height="59.2" fill="#a1a1aa" />
			{#each frames as x}
				<rect {x} y="44.6" width="49.2" height="48.1" fill="#fbfbf8" />
				<rect
					x={x + 6.6}
					y="50.6"
					width="36"
					height="36.4"
					fill="none"
					stroke="#a1a1aa"
					stroke-width="0.6"
					stroke-dasharray="2 1.5"
				/>
			{/each}
			<text
				x="105"
				y="88"
				font-size="54"
				font-weight="700"
				fill="#fbfbf8"
				text-anchor="middle"
				textLength={width(number, 16, 66)}
				lengthAdjust="spacingAndGlyphs">{number}</text
			>
			<text
				x="179"
				y="127"
				font-size="34"
				font-weight="700"
				fill="#26262a"
				text-anchor="middle"
				textLength={width(distance, 13.5, 40)}
				lengthAdjust="spacingAndGlyphs">{distance}</text
			>
			<rect x="164" y="129.5" width="30" height="7" rx="1.5" fill="#26262a" />
			<text x="179" y="135" font-size="5.5" font-weight="700" fill="#fbfbf8" text-anchor="middle"
				>KM</text
			>
		</svg>
		<figcaption class="text-sm text-center mt-2">
			Placeholder: no digital copy of this bib yet.
		</figcaption>
	{/if}
</figure>
