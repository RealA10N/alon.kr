<script lang="ts">
	import StringBox from '$lib/strings/StringBox.svelte';
	import Grabzone from '$lib/grabs/Grabzone.svelte';
	import type { BoxState } from '$lib/interfaces/strings';
	import type { Writable } from 'svelte/store';

	export let items: Writable<BoxState[]>;
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
