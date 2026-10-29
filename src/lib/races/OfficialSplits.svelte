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
		const previous: OfficialSplit =
			i > 0 ? checkpoints[i - 1] : { label: 'Start', km: 0, time: '0' };
		const split = parseTime(checkpoint.time) - parseTime(previous.time);
		// Some timers name checkpoints by street without a distance; pace needs both ends.
		const known = checkpoint.km !== undefined && previous.km !== undefined;
		const pace = known ? split / ((checkpoint.km as number) - (previous.km as number)) : undefined;
		return { ...checkpoint, split, pace };
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
			{#if rows.length === 0}
				<tr
					><td>—</td><td class="text-right">—</td><td class="text-right">—</td><td
						class="text-right">—</td
					></tr
				>
			{/if}
			{#each rows as row}
				<tr>
					<td>
						{row.label}
						{#if row.km !== undefined}
							<span class="text-zinc-500 text-sm">({row.km.toFixed(1)} km)</span>
						{/if}
					</td>
					<td class="text-right">{formatTime(parseTime(row.time))}</td>
					<td class="text-right">{formatTime(row.split)}</td>
					<td class="text-right">{row.pace !== undefined ? `${formatPace(row.pace)} /km` : '—'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
