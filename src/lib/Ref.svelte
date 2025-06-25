<script lang="ts">
	import { type Writable } from 'svelte/store';
	import { type Reference } from '$lib/ReferencesList.svelte';

	export let references: Writable<Reference[]>;

	export let title: string;
	export let url: string;
	export let people: string | string[];

	let number: number;

	const isRefsEquals = (a: Reference, b: Reference): boolean =>
		a.title === b.title && a.url === b.url && a.people === b.people;

	const addRefToList = (ref: Reference) => references.update((refs) => [...refs, ref]);

	$: {
		const ref = { title, url, people };
		const idx = $references.findIndex((r) => isRefsEquals(r, ref));

		if (idx !== -1) {
			number = idx + 1;
		} else {
			addRefToList(ref);
			number = $references.length;
		}
	}
</script>

<sup id="src{number}"><a class="no-underline" href="#ref{number}">[{number}]</a></sup>
