import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import rehypeKatexSvelte from 'rehype-katex-svelte';
import remarkMath from 'remark-math';

const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.svx'],

	smartypants: {
		dashes: 'oldschool'
	},

	remarkPlugins: [remarkMath],
	rehypePlugins: [rehypeKatexSvelte],
	layout: 'src/routes/posts/_PostLayout.svelte'
});

export default config;
