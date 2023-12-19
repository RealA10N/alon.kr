<script lang="ts">
	import { flip } from 'svelte/animate';
	import { blur } from 'svelte/transition';
	import StringBox from '$lib/strings/StringBox.svelte';
	import type { BoxState } from '$lib/interfaces/strings';
	export let array: BoxState[];
</script>

{#each array as state (state.text)}
	<div
		class="inline-block"
		animate:flip={{ duration: 400 }}
		in:blur={{ duration: 400 }}
		out:blur={{ duration: 150 }}
	>
		<StringBox {state} />
	</div>
{/each}
