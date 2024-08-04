<script lang="ts">
	import type { Package } from '$src/lib/interfaces/package';

	export let pkg: Package;
	export const prerender = true;
</script>

<h1>{pkg.name}</h1>

<slot />
