<script lang="ts">
	import BooleanButton from '$lib/logic/BooleanButton.svelte';
	import BooleanTag from '$lib/logic/BooleanTag.svelte';

	export let bits: boolean[] = [];
	export let name: string = '';

	// log2 of the smallest power of two that is greater or equal to the bits length.
	$: variableCount = Math.ceil(Math.log2(bits.length));

	const subscripts = '₀₁₂₃₄₅₆₇₈₉';
	const toSubscript = (n: number): string =>
		n === 0 ? '' : toSubscript(Math.floor(n / 10)) + subscripts[n % 10];

	const variableName = (i: number) => 'x' + toSubscript(i + 1);

	const locationToValue = (row: number, col: number) => Boolean((row >> col) & 1);
</script>

<table class="m-2 text-center">
	<thead>
		<tr>
			{#each Array(variableCount) as _, i}
				<th>{variableName(i)}</th>
			{/each}
			<!-- The output column is a bit wider to slightly longer function
			 names to fit nicely without changing the table dimensions. -->
			<th class="w-24">{name}</th>
		</tr>
	</thead>
	<tbody>
		{#each bits as b, row}
			<tr>
				{#each Array(variableCount) as _, col}
					<td><BooleanTag value={locationToValue(row, col)} /></td>
				{/each}
				<td><BooleanButton value={b} /></td>
			</tr>
		{/each}
	</tbody>
</table>
