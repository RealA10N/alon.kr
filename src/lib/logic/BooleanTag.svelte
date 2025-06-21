<script lang="ts">
	export let value: boolean;
</script>

<span class="inline-block w-14">
	<span class="text-sm border-b border-zinc-500" class:true={value}>
		{value ? 'True' : 'False'}
	</span>
</span>

<style lang="postcss">
	.true {
		@apply border-red-500;
	}
</style>
