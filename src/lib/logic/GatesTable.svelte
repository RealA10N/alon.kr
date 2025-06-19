<script lang="ts">
	import GateCard from '$lib/logic/GateCard.svelte';

	import type { GateDesc } from '$lib/logic/booleanGates';

	export let gates: GateDesc[];
	export let highlightIndices: boolean[] = Array(gates.length).fill(false);
	export let selectedGateIdx = 0;

	export let select = (gateIdx: number): any => (selectedGateIdx = gateIdx);
</script>

<div class="w-96 flex flex-row flex-wrap items-center justify-center">
	{#each gates as g (g.id)}
		<GateCard
			name={g.name}
			description={g.description}
			highlight={highlightIndices[g.id]}
			onHover={() => select(g.id)}
			focus={selectedGateIdx === g.id}
		/>
	{/each}
</div>
