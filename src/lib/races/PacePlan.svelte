<script lang="ts">
	import { formatTime } from './race';

	export let distanceKm: number;
	export let pace: number;

	// Even-pace checkpoint times: every 5 km for long races, every km for short ones.
	$: step = distanceKm > 12 ? 5 : 1;
	$: marks = [
		...Array.from({ length: Math.floor((distanceKm - 0.01) / step) }, (_, i) => (i + 1) * step),
		distanceKm
	];
</script>

<div class="overflow-x-auto">
	<table class="w-full text-base tabular-nums">
		<thead>
			<tr>
				<th class="text-left">Distance</th>
				<th class="text-right">Target time</th>
			</tr>
		</thead>
		<tbody>
			{#each marks as km}
				<tr>
					<td>{km === distanceKm ? 'Finish' : `${km} km`}</td>
					<td class="text-right">{formatTime(km * pace)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
