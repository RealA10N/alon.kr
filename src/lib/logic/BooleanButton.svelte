<script lang="ts">
	export let value: boolean;
	export let onClick: () => any = () => (value = !value);
</script>

<button class="w-14" on:click={onClick} class:true={value}>
	{value ? 'True' : 'False'}
</button>

<style lang="postcss">
	button.true {
		@apply border-red-500;
	}
</style>
