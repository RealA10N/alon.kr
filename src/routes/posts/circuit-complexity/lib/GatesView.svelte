<script lang="ts" context="module">
	type GateFilter = (g: GateDesc) => boolean;

	type OptionWithFilter = Option & {
		filter?: GateFilter;
	};
</script>

<script lang="ts">
	import Figure from '$lib/Figure.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import type { Option } from '$lib/Toggle.svelte';
	import AnimationButton from '$lib/AnimationButton.svelte';

	import TruthTable from '$lib/logic/TruthTable.svelte';
	import { bitsToId, BooleanGates } from '$lib/logic/booleanGates';
	import type { GateDesc } from '$lib/logic/booleanGates';
	import GatesTable from '$lib/logic/GatesTable.svelte';

	const isSymmetric = (g: GateDesc) => g.bits[1] === g.bits[2];
	const isAsymmetric = (g: GateDesc) => !isSymmetric(g);

	const isX1Dependent = (g: GateDesc) => g.bits[0] !== g.bits[1] || g.bits[2] !== g.bits[3];
	const isX1Independent = (g: GateDesc) => !isX1Dependent(g);

	const isX2Dependent = (g: GateDesc) => g.bits[0] !== g.bits[2] || g.bits[1] !== g.bits[3];
	const isX2Independent = (g: GateDesc) => !isX2Dependent(g);

	const isNumberOfTrueOutputs = (n: number) => (g: GateDesc) =>
		g.bits.filter((b) => b).length === n;

	const isConstant = (g: GateDesc) => isNumberOfTrueOutputs(0)(g) || isNumberOfTrueOutputs(4)(g);

	const isIncreasing = (g: GateDesc) =>
		g.bits[0] <= g.bits[1] &&
		g.bits[0] <= g.bits[2] &&
		g.bits[1] <= g.bits[3] &&
		g.bits[2] <= g.bits[3];

	const isDecreasing = (g: GateDesc) =>
		g.bits[0] >= g.bits[1] &&
		g.bits[0] >= g.bits[2] &&
		g.bits[1] >= g.bits[3] &&
		g.bits[2] >= g.bits[3];

	const isMonotone = (g: GateDesc) => isIncreasing(g) || isDecreasing(g);

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
		],
		[
			{ name: 'Monotone' },
			{ name: 'Monotone', filter: isMonotone, focus: true },
			{ name: 'Increasing', filter: isIncreasing, focus: true },
			{ name: 'Decreasing', filter: isDecreasing, focus: true }
		]
	] as OptionWithFilter[][];

	let selectedOptions = options.map((o) => o[0]);

	const selectedFilters = (selectedOptions: OptionWithFilter[]): GateFilter[] =>
		selectedOptions.filter((o) => o?.filter !== undefined).map((o) => o.filter as GateFilter);

	let selectedGateIdx = 0;
	$: selectedGate = BooleanGates[selectedGateIdx];

	let select = (gateIdx: number) => {
		selectedGateIdx = gateIdx;
		stop();
	};

	let selectBits = (bits: boolean[]) => select(bitsToId(bits));

	const next = () => {
		const inc = (i: number) => (i + 1) % BooleanGates.length;

		for (let i = inc(selectedGateIdx); i !== selectedGateIdx; i = inc(i)) {
			if (highlightIndices[i]) {
				return select(i);
			}
		}

		// None of the gates are highlighted, so we just select the next one.
		select(inc(selectedGateIdx));
	};

	let stop: () => void = () => {};

	const computeHighlightedIndices = (
		selectedOptions: OptionWithFilter[],
		gates: GateDesc[]
	): boolean[] => {
		const filters = selectedFilters(selectedOptions);
		if (filters.length === 0) {
			// If no filters are selected, instead of highlighting all gates,
			// we highlight none of them.
			return Array(gates.length).fill(false);
		}

		return gates.map((g) => filters.every((f) => f(g)));
	};

	$: highlightIndices = computeHighlightedIndices(selectedOptions, BooleanGates);

	export const highlightDependentOnBothVariables = () => {
		selectedOptions = options.map((o) => o[0]);
		selectedOptions[0] = options[0][1]; // x₁-Dependent
		selectedOptions[1] = options[1][1]; // x₂-Dependent
	};

	export const highlightDependentOnX1 = () => {
		selectedOptions = options.map((o) => o[0]);
		selectedOptions[0] = options[0][1]; // x₁-Dependent
		selectedOptions[1] = options[1][2]; // x₂-Independent
	};

	export const highlightDependentOnX2 = () => {
		selectedOptions = options.map((o) => o[0]);
		selectedOptions[0] = options[0][2]; // x₁-Independent
		selectedOptions[1] = options[1][1]; // x₂-Dependent
	};

	export const highlightConstants = () => {
		selectedOptions = options.map((o) => o[0]);
		selectedOptions[0] = options[0][2]; // x₁-Independent
		selectedOptions[1] = options[1][2]; // x₂-Independent
	};
</script>

<Figure>
	<div class="flex flex-row items-center justify-center gap-4" slot="content">
		<GatesTable gates={BooleanGates} bind:selectedGateIdx bind:highlightIndices bind:select />
		<div class="flex flex-col justify-items items-center">
			<TruthTable bind:select={selectBits} name={selectedGate.name} bind:bits={selectedGate.bits} />
			<AnimationButton {next} bind:stop />
		</div>
	</div>
	<svelte:fragment slot="buttons">
		{#each options as option, i}
			<Toggle options={option} bind:selected={selectedOptions[i]} />
		{/each}
	</svelte:fragment>

	<svelte:fragment slot="caption">
		A representation of the 16 boolean gates of fanin 2.
	</svelte:fragment>
</Figure>
