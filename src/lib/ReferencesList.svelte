<script lang="ts" context="module">
	import { type Writable, writable } from 'svelte/store';

	export type Reference = {
		title: string;
		url: string;
		people?: string[] | string;
	};

	export const NewReferenceList = () => writable([] as Reference[]);
</script>

<script lang="ts">
	export let references: Writable<Reference[]>;
</script>

<ol class="my-0">
	{#each $references as ref, i}
		<li id="ref{i + 1}">
			<a href={ref.url} target="_blank" class="no-underline hover:underline">
				{ref.title}
				<span class="italic text-sm">
					{ref.people}
				</span>
			</a>
			<a href="#src{i + 1}" class="no-underline text-sm">↩</a>
		</li>
	{/each}
</ol>
