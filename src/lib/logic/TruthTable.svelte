<script lang="ts">
	import BooleanButton from '$lib/logic/BooleanButton.svelte';
	import BooleanTag from '$lib/logic/BooleanTag.svelte';
	import { toSubscript } from '$lib/strings/subscripts';

	export let bits: boolean[] = [];
	export let title: string = '';

	// log2 of the smallest power of two that is greater or equal to the bits length.
	$: variableCount = Math.ceil(Math.log2(bits.length));

	const variableName = (i: number) => 'x' + toSubscript(i + 1);

	const locationToValue = (row: number, col: number) => Boolean((row >> col) & 1);

	export let select = (newBits: boolean[]): any => (bits = newBits);

	const toggle = (row: number) => {
		const newBits = [...bits];
		newBits[row] = !newBits[row];
		select(newBits);
	};
</script>

<table class="m-2 text-center">
	<thead>
		<tr>
			{#each Array(variableCount) as _, i}
				<th>{variableName(i)}</th>
			{/each}
			<th>{@html title}</th>
		</tr>
	</thead>
	<tbody>
		{#each bits as b, row}
			<tr>
				{#each Array(variableCount) as _, col}
					<td><BooleanTag value={locationToValue(row, col)} /></td>
				{/each}
				<td><BooleanButton value={b} onClick={() => toggle(row)} /></td>
			</tr>
		{/each}
	</tbody>
</table>
