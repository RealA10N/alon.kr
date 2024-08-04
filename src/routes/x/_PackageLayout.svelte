<!-- This is a workaround, since MDSvex does not officially support
	preprocessing (typescript and postcss) in layout files.
	So, this layout file does not contain any of that, but it directly imports
	one does use it. -->

<script>
	import PackageLayout from './PackageLayout.svelte';
</script>

<PackageLayout pkg={$$props}>
	<slot />
</PackageLayout>
