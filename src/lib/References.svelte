<script lang="ts">
	export let references: { title: string; url: string; people: string[] | string }[];
</script>

<ol>
	{#each references as ref, i}
		<li id="ref{i + 1}">
			<a href={ref.url} class="no-underline hover:underline">
				{ref.title}
				<span class="italic text-sm">
					{#if typeof ref.people === 'string'}
						{ref.people}
					{:else}
						{ref.people?.join(', ') ?? ''}
					{/if}
				</span>
			</a>
			<a href="#src{i + 1}" class="no-underline text-sm">↩</a>
		</li>
	{/each}
</ol>
