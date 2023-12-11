<script lang="ts">
	export let width: number | undefined = undefined;
</script>

<div
	bind:clientWidth={width}
	class="w-screen relative overflow-x-hidden"
	style="left: calc(-50vw + 50%);"
>
	<slot />
</div>
