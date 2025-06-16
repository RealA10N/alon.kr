<script lang="ts">
	export let value: boolean;

	const toggle = () => (value = !value);
</script>

<button class="w-14" on:click={toggle} class:true={value}>
	{value ? 'True' : 'False'}
</button>

<style lang="postcss">
	button.true {
		@apply border-red-500;
	}
</style>
