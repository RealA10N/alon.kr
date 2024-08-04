import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import rehypeKatexSvelte from 'rehype-katex-svelte';
import remarkMath from 'remark-math';
import readingTime from 'mdsvex-reading-time';

const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.svx'],

	smartypants: {
		dashes: 'oldschool'
	},

	remarkPlugins: [[readingTime, { wpm: 185 }], remarkMath],
	rehypePlugins: [rehypeKatexSvelte],
	layout: {
		post: 'src/routes/posts/_PostLayout.svelte',
		package: 'src/routes/x/_PackageLayout.svelte'
	}
});

export default config;
