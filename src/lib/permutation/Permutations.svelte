<script lang="ts">
	import { flip } from 'svelte/animate';
	import { blur } from 'svelte/transition';
	import { LetterMode } from '$lib/interfaces/stringMatching';
	import LetterBox from '$lib/strings/LetterBox.svelte';
	import type { Permutation } from './permutation';
	export let permutation: Permutation;
</script>

<div class="flex flex-wrap justify-center gap-2">
	{#each permutation as num (num)}
		<div animate:flip={{ duration: 400 }} in:blur={{ duration: 400 }} out:blur={{ duration: 150 }}>
			<LetterBox state={{ text: (num + 1n).toString(), mode: LetterMode.Regular }} />
		</div>
	{/each}
</div>
