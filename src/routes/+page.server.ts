import matter from 'gray-matter';
import type { Post } from '$lib/interfaces/post';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load = (async () => {
    const globs = import.meta.glob('./posts/*/+page.md', { as: 'raw' });
    const contents = await Promise.all(Object.values(globs).map(fn => fn()));
    const posts = contents.map(raw => matter(raw).data as Post);
    return { posts: posts };
}) satisfies PageServerLoad;
