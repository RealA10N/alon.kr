<script lang="ts" context="module">
	import type { BoxState as GenericBoxState, Stringable } from '$lib/interfaces/strings';
</script>

<script lang="ts" generics="Text extends Stringable">
	import StringBox from '$lib/strings/StringBox.svelte';
	import Grabzone from '$lib/grabs/Grabzone.svelte';

	type BoxState = GenericBoxState<Text>;

	export let items: BoxState[];
	export let onGrab: (item: BoxState) => any = () => {};
	export let onUpdate: (item: BoxState) => any = () => {};
	export let onRelease: (item: BoxState) => any = () => {};
</script>

<Grabzone
	{items}
	let:item
	let:dummy
	flipOptions={{ duration: 400 }}
	{onGrab}
	{onRelease}
	{onUpdate}
>
	<div class="inline-block" class:opacity-50={dummy}>
		<StringBox state={item} />
	</div>
</Grabzone>
