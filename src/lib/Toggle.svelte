<script lang="ts" context="module">
	export type Option = {
		name: string;
		focus?: boolean;
	};
</script>

<script lang="ts">
	export let options: Option[] = [];
	let selectedIndex: number = 0;

	export let selected: Option;
	$: selected = options[selectedIndex];

	const toggle = () => (selectedIndex = (selectedIndex + 1) % options.length);
</script>

<button {...$$restProps} on:click={toggle} class:focus={selected.focus}>
	{selected.name}
</button>
