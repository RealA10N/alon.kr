import moment from 'moment';
import type { PageServerLoad } from './$types';
import type { Post } from '$lib/interfaces/post';

export const prerender = true;

function globToUrl(glob: string) {
	const sections = glob.split('/');
	return [''].concat(sections.splice(1, sections.length - 2)).join('/');
}

export const load = (async () => {
	const globs = import.meta.glob('./posts/*/+page.md');

	const contents = await Promise.all(
		Object.entries(globs).map(async ([glob, fn]) => [globToUrl(glob), await fn()])
	);

	const posts = contents.map(([url, { metadata }]) => {
		metadata as Post;
		return {
			...metadata,
			url: url,
			published: moment(metadata.published).unix() * 1000
		} as Post;
	});

	posts.sort((a, b) => a.published - b.published).reverse();

	return { posts: posts };
}) satisfies PageServerLoad;
