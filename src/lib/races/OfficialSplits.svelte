<script lang="ts">
	import { formatPace, formatTime, parseTime, type OfficialSplit } from './race';

	export let splits: OfficialSplit[];
	export let finishKm: number;
	export let finishTime: string | undefined;

	$: checkpoints = [
		...splits,
		...(finishTime ? [{ label: 'Finish', km: finishKm, time: finishTime }] : [])
	];
	$: rows = checkpoints.map((checkpoint, i) => {
		const previous = i > 0 ? checkpoints[i - 1] : { km: 0, time: '0' };
		const split = parseTime(checkpoint.time) - parseTime(previous.time);
		return { ...checkpoint, split, pace: split / (checkpoint.km - previous.km) };
	});
</script>

<div class="overflow-x-auto">
	<table class="w-full text-base tabular-nums">
		<thead>
			<tr>
				<th class="text-left">Checkpoint</th>
				<th class="text-right">Time</th>
				<th class="text-right">Split</th>
				<th class="text-right">Pace</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row}
				<tr>
					<td>{row.label} <span class="text-zinc-500 text-sm">({row.km.toFixed(1)} km)</span></td>
					<td class="text-right">{formatTime(parseTime(row.time))}</td>
					<td class="text-right">{formatTime(row.split)}</td>
					<td class="text-right">{formatPace(row.pace)} /km</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
