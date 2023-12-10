import matter from 'gray-matter';
import moment from 'moment';
import type { PageServerLoad } from './$types';
import type { Post } from '$lib/interfaces/post';

export const prerender = true;

function globToUrl(glob: string) {
	const sections = glob.split('/');
	return [''].concat(sections.splice(1, sections.length - 2)).join('/');
}

export const load = (async () => {
	const globs = import.meta.glob('./posts/*/+page.md', { as: 'raw' });

	const contents = await Promise.all(
		Object.entries(globs).map(async ([glob, fn]) => [globToUrl(glob), await fn()])
	);

	const posts = contents.map(([url, content]) => {
		const data = matter(content).data;
		return {
			...data,
			url: url,
			published: moment(data.published).unix() * 1000
		} as Post;
	});

	posts.sort((a, b) => a.published - b.published).reverse();

	return { posts: posts };
}) satisfies PageServerLoad;
