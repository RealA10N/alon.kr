import matter from 'gray-matter';
import type { Post } from '$lib/interfaces/post';
import type { PageServerLoad } from './$types';

export const prerender = true;

function globToUrl(glob: string) {
    const sections = glob.split('/');
    return [''].concat(sections.splice(1, sections.length-2)).join('/');
}

export const load = (async () => {
    const globs = import.meta.glob('./posts/*/+page.md', { as: 'raw' });
    const contents = await Promise.all(Object.entries(globs).map(async ([glob, fn]) => [globToUrl(glob), await fn()]));
    const posts = contents.map(([url, content]) => ({...matter(content).data, url: url} as Post));
    return { posts: posts };
}) satisfies PageServerLoad;
