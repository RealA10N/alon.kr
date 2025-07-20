import moment from 'moment';
import type { PageServerLoad } from './$types';
import type { Post } from '$lib/interfaces/post';

export const prerender = true;

function globToUrl(glob: string) {
	const sections = glob.split('/');
	return [''].concat(sections.splice(1, sections.length - 2)).join('/');
}

const metadataToPost = (metadata: any, url: string): Post => {
	const published = metadata.published ? moment(metadata.published).unix() * 1000 : undefined;
	return {
		...metadata,
		url,
		published
	} as Post;
};

export const _getPublishedPosts = async () => {
	const globs = import.meta.glob('./posts/*/+page.md');

	const contents = await Promise.all(
		Object.entries(globs).map(async ([glob, fn]) => [globToUrl(glob), await fn()])
	);

	const posts = contents.map(([url, { metadata }]) => metadataToPost(metadata, url));

	const publishedPosts = posts.filter((post) => post.published !== undefined);
	publishedPosts.sort((a, b) => (a.published ?? 0) - (b.published ?? 0)).reverse();

	return publishedPosts;
};

export const load = (async () => {
	return { posts: await _getPublishedPosts() };
}) satisfies PageServerLoad;
