<script lang="ts" context="module">
	type GateDesc = {
		id: number;
		name: string;
		description?: string;
		bits: boolean[];
		highlight?: boolean;
		focus?: boolean;
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
	import AnimationButton from '$lib/AnimationButton.svelte';
	
	import Gate from './Gate.svelte';
import TruthTable from '$lib/logic/TruthTable.svelte';

	const idToBits = (n: number, len: number) =>
		Array.from({ length: len }, (_, i) => (n & (1 << i)) !== 0);

	let gatesBase = [
		{ name: '⊥', description: 'False', focus: true },
		{ name: '↓', description: 'Not Or' },
		{ name: '¬x₁ ∧ x₂' },
		{ name: '¬x₁', description: 'Negation' },
		{ name: 'x₁ ∧ ¬x₂' },
		{ name: '¬x₂', description: 'Negation' },
		{ name: '⊕', description: 'Exclusive Or' },
		{ name: '↑', description: 'Not And' },
		{ name: '∧', description: 'And' },
		{ name: '↔', description: 'Equality' },
		{ name: 'x₂', description: 'Identity' },
		{ name: 'x₁ → x₂', description: 'Implication' },
		{ name: 'x₁', description: 'Identity' },
		{ name: 'x₂ → x₁', description: 'Implication' },
		{ name: '∨', description: 'Or' },
		{ name: '⊤', description: 'True' }
	].map((g, id) => ({
		...g,
		id: id,
		bits: idToBits(id, 4)
	})) as GateDesc[];

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

		$: gates = gatesBase.map((g) => ({
		...g,
		highlight: isHighlighted(g, selectedOptions)
	}));

	const hover = (g: GateDesc) => (stop(), select(g));

	const select = (g: GateDesc) => {
		gatesBase.forEach((gate) => (gate.focus = gate.id === g.id));
		gatesBase = [...gatesBase];
		console.log(gatesBase.map((g) => g.bits));
	};

	const next = () => {
		const inc = (i: number) => (i + 1) % gatesBase.length;

		for (let i = inc(selectedGateIdx); i !== selectedGateIdx; i = inc(i)) {
			if (gates[i].highlight) {
				return select(gatesBase[i]);
			}
		}

		// None of the gates are highlighted, so we just select the next one.
		select(gates[inc(selectedGateIdx)]);
	};

	let stop: () => void = () => {};

	$: selectedGateIdx = Math.max(
		0,
		gatesBase.findIndex((g) => g.focus)
	);

	$: selectedGate = gatesBase[selectedGateIdx];
</script>

<Figure>
	<div class="flex flex-row items-center justify-center gap-4" slot="content">
		<div class="w-96 flex flex-row flex-wrap items-center justify-center">
			{#each gates as g (g.id)}
				<Gate
					name={g.name}
					description={g.description}
					highlight={g.highlight}
					onHover={() => hover(g)}
					focus={g.focus}
				/>
			{/each}
		</div>
		<div class="flex flex-col justify-items items-center">
			{#if selectedGate}
				<TruthTable bits={selectedGate.bits} name={selectedGate.name} />
			{/if}

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
