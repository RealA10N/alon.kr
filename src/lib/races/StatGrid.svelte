<script lang="ts" context="module">
	export type Stat = {
		label: string;
		value: string | number | undefined;
		detail?: string;
		/** Colors the detail line, e.g. ahead of / behind target. */
		tone?: 'good' | 'bad';
	};
</script>

<script lang="ts">
	export let stats: Stat[];
	$: visible = stats.filter((stat) => stat.value !== undefined && stat.value !== '');
</script>

<dl class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
	{#each visible as stat}
		<div
			class="border rounded-lg px-3 py-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
		>
			<dt class="text-sm text-zinc-500">{stat.label}</dt>
			<dd class="font-bold text-xl text-zinc-800 dark:text-zinc-200 tabular-nums">{stat.value}</dd>
			{#if stat.detail}
				<dd
					class="text-sm tabular-nums"
					class:text-green-600={stat.tone === 'good'}
					class:dark:text-green-400={stat.tone === 'good'}
					class:text-red-500={stat.tone === 'bad'}
				>
					{stat.detail}
				</dd>
			{/if}
		</div>
	{/each}
</dl>
