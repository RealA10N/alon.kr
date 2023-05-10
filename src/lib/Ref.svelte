<script lang="ts">
	export let title: string;
	export let url: string;
	export let people: string | string[];
	export let references: { title: string; url: string; people: string | string[] }[];

	references.push({ title: title, url: url, people: people });
	export let number = references.length;
</script>

<sup id="src{number}"><a href="#ref{number}"> {number} </a></sup>
