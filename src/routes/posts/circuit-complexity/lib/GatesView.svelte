<script lang="ts" context="module">
	type GateDesc = {
		id: number;
		name: string;
		description?: string;
		bits: boolean[];
		highlight?: boolean;
	};

	type GateFilter = (g: GateDesc) => boolean;

	type OptionWithFilter = Option & {
		filter?: GateFilter;
	};
</script>

<script lang="ts">
	import Figure from '$lib/Figure.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import type { Option } from '$lib/Toggle.svelte';
	import BooleanTag from './BooleanTag.svelte';

	import Gate from './Gate.svelte';

	const gatesBase = [
		{ id: 1, name: '⊥', description: 'False', bits: [false, false, false, false] },
		{ id: 2, name: '↓', description: 'Not Or', bits: [true, false, false, false] },
		{ id: 3, name: '¬x₁ ∧ x₂', bits: [false, true, false, false] },
		{ id: 4, name: '¬x₁', description: 'Negation', bits: [true, true, false, false] },
		{ id: 5, name: 'x₁ ∧ ¬x₂', bits: [false, false, true, false] },
		{ id: 6, name: '¬x₂', description: 'Negation', bits: [true, false, true, false] },
		{ id: 7, name: '⊕', description: 'Exclusive Or', bits: [false, true, true, false] },
		{ id: 8, name: '↑', description: 'Not And', bits: [true, true, true, false] },
		{ id: 9, name: '∧', description: 'And', bits: [false, false, false, true] },
		{ id: 10, name: '↔', description: 'Equality', bits: [true, false, false, true] },
		{ id: 11, name: 'x₂', description: 'Identity', bits: [false, true, false, true] },
		{ id: 12, name: 'x₁ → x₂', description: 'Implication', bits: [true, true, false, true] },
		{ id: 13, name: 'x₁', description: 'Identity', bits: [false, false, true, true] },
		{ id: 14, name: 'x₂ → x₁', description: 'Implication', bits: [true, false, true, true] },
		{ id: 15, name: '∨', description: 'Or', bits: [false, true, true, true] },
		{ id: 16, name: '⊤', description: 'True', bits: [true, true, true, true] }
	] as GateDesc[];

	const isSymmetric = (g: GateDesc) => g.bits[1] === g.bits[2];
	const isAsymmetric = (g: GateDesc) => !isSymmetric(g);

	const isX1Dependent = (g: GateDesc) => g.bits[0] !== g.bits[2] || g.bits[1] !== g.bits[3];
	const isX1Independent = (g: GateDesc) => !isX1Dependent(g);

	const isX2Dependent = (g: GateDesc) => g.bits[0] !== g.bits[1] || g.bits[2] !== g.bits[3];
	const isX2Independent = (g: GateDesc) => !isX2Dependent(g);

	const isNumberOfTrueOutputs = (n: number) => (g: GateDesc) =>
		g.bits.filter((b) => b).length === n;

	const isConstant = (g: GateDesc) => isNumberOfTrueOutputs(0)(g) || isNumberOfTrueOutputs(4)(g);

	let options = [
		[
			{ name: 'x₁-Dependent' },
			{ name: 'x₁-Dependent', filter: isX1Dependent, focus: true },
			{ name: 'x₁-Independent', filter: isX1Independent, focus: true }
		],
		[
			{ name: 'x₂-Dependent' },
			{ name: 'x₂-Dependent', filter: isX2Dependent, focus: true },
			{ name: 'x₂-Independent', filter: isX2Independent, focus: true }
		],
		[
			{ name: 'Symmetric' },
			{ name: 'Symmetric', filter: isSymmetric, focus: true },
			{ name: 'Asymmetric', filter: isAsymmetric, focus: true }
		],
		[
			{ name: 'Balanced' },
			{ name: 'Balanced', filter: isNumberOfTrueOutputs(2), focus: true },
			{ name: '1 True Output', filter: isNumberOfTrueOutputs(1), focus: true },
			{ name: '3 True Output', filter: isNumberOfTrueOutputs(3), focus: true },
			{ name: 'Constant', filter: isConstant, focus: true }
		]
	] as OptionWithFilter[][];

	let selectedOptions = options.map((o) => o[0]);

	const selectedFilters = (selectedOptions: OptionWithFilter[]): GateFilter[] =>
		selectedOptions.filter((o) => o?.filter !== undefined).map((o) => o.filter as GateFilter);

	const isHighlighted = (g: GateDesc, selectedOptions: Option[]) =>
		selectedFilters(selectedOptions).length > 0 &&
		selectedFilters(selectedOptions).every((f) => f(g));

	// Create reactive gates array that updates when filters change
	$: gates = gatesBase.map((g) => ({
		...g,
		highlight: isHighlighted(g, selectedOptions)
	}));

	let selectedGate;
</script>

<Figure>
	<div class="flex flex-row items-center justify-center gap-4" slot="content">
		<div class="w-96 flex flex-row flex-wrap items-center justify-center">
			{#each gates as g (g.id)}
				<Gate name={g.name} description={g.description} highlight={g.highlight} />
			{/each}
		</div>

		{#if selectedGate}
			<table>
				<thead>
					<tr>
						<th>x₁</th>
						<th>x₂</th>
						<th>{selectedGate.name}</th>
					</tr>
				</thead>
				<tbody>
					{#each selectedGate.bits as b, i}
						<tr>
							<td><BooleanTag value={Boolean(Math.floor(i / 2))} /></td>
							<td><BooleanTag value={Boolean(i % 2)} /></td>
							<td><BooleanTag value={b} /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
	<svelte:fragment slot="buttons">
		{#each options as option, i}
			<Toggle options={option} bind:selected={selectedOptions[i]} />
		{/each}
	</svelte:fragment>
</Figure>
