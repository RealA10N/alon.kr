<script lang="ts">
	export let value: boolean;
</script>

<span class="tag inline-block w-14" class:true={value}>
	{value ? 'True' : 'False'}
</span>

<style lang="postcss">
	.tag.true {
		@apply border-red-500;
	}
</style>
