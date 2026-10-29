<script lang="ts" context="module">
	export type Item = {
		href: string;
		title: string;
		/** The headline number, shown on the right (e.g. the finish time). */
		value?: string;
		/** A smaller line under the value (e.g. the pace). */
		valueSub?: string;
		/** Secondary facts, one line each under the title. */
		meta: string[];
	};
</script>

<script lang="ts">
	// The phone version of a results table: one full-width, easy-to-tap row per item.
	export let items: Item[];
</script>

<ul
	class="m-0 p-0 border rounded-md border-zinc-600 dark:border-zinc-400 divide-y divide-zinc-300 dark:divide-zinc-700"
>
	{#each items as item}
		<li class="m-0 list-none">
			<a
				href={item.href}
				class="flex items-baseline justify-between gap-3 px-3 py-2.5 no-underline active:bg-zinc-200 dark:active:bg-zinc-800"
			>
				<span class="min-w-0">
					<span
						class="block font-bold text-zinc-800 dark:text-zinc-200 underline underline-offset-[3px]"
					>
						{item.title}
					</span>
					{#each item.meta as line}
						<span class="block text-sm tabular-nums">{line}</span>
					{/each}
				</span>
				{#if item.value}
					<span class="text-right tabular-nums shrink-0">
						<span class="block font-bold text-zinc-800 dark:text-zinc-200">{item.value}</span>
						{#if item.valueSub}<span class="block text-sm">{item.valueSub}</span>{/if}
					</span>
				{/if}
			</a>
		</li>
	{/each}
</ul>
