<!-- This is a workaround, since MDSvex does not officially support
	preprocessing (typescript and postcss) in layout files.
	So, this layout file does not contain any of that, but it directly imports
	one does use it. -->

<script>
	import PostLayout from './PostLayout.svelte';
	/** @type {string} */
	export let title;
	/** @type {string | undefined} */
	export let description;
	/** @type {number} */
	export let published;
	/** @type {number} */
	export let length;
	/** @type {string[]} */
	export let tags;
</script>

<PostLayout {title} {description} {published} {length} {tags}>
	<slot />
</PostLayout>
