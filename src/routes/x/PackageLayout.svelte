<script lang="ts">
	import { type Package, packageUrl, documentationUrl } from '$src/lib/interfaces/package';
	import Header from '$src/lib/Header.svelte';
	import Metadata from '$src/lib/Metadata.svelte';

	export let pkg: Package;
	export const prerender = true;
</script>

<svelte:head>
	<meta name="go-import" content="{packageUrl(pkg)} {pkg.versionSourceControl} {pkg.sourceUrl}" />
</svelte:head>

<Metadata title={pkg.title} description={pkg.description} />

<Header title={pkg.title} description={pkg.description} />

<h2>Get</h2>
<code>go get {packageUrl(pkg)}</code>

<h2>Source</h2>
<p>can be found <a target="_blank" href={pkg.sourceUrl}>here</a>.</p>

<h2>Documentation</h2>
<p>can be found <a target="_blank" href={documentationUrl(pkg)}>here</a>.</p>

<slot />
