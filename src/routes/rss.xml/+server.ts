// This follows the tutorial in:
// https://gebna.gg/blog/how-to-add-rss-feed-to-sveltekit-app

import { Feed, type Item } from 'feed';
import { description } from '$src/routes/+page.svelte';
import { _getPublishedPosts } from '$src/routes/+page.server';
import type { Post } from '$lib/interfaces/post';

const createFeed = () =>
	new Feed({
		title: 'Alon Krymgand',
		description: description,
		id: 'https://alon.kr/',
		link: 'https://alon.kr/',
		language: 'en', // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
		favicon: 'https://alon.kr/favicon.ico',
		copyright: `Copyright ${new Date().getFullYear().toString()}, Alon Krymgand`,
		generator: '🙂', // optional, default = 'Feed for Node.js'
		feedLinks: {
			rss: 'https://alon.kr/rss.xml'
		},
		author: {
			name: 'Alon Krymgand',
			link: 'https://alon.kr/'
		},
		ttl: 60
	});

const home = new URL('https://alon.kr');
const makeAbsoluteUrl = (relativeUrl: string) => new URL(relativeUrl, home).toString();

const postToFeedItem = (post: Post) =>
	({
		title: post.title,
		description: post.description,
		id: makeAbsoluteUrl(post.url),
		link: makeAbsoluteUrl(post.url),
		image: post.thumbnail ? makeAbsoluteUrl(post.thumbnail) : undefined,
		date: new Date(post.published || Date.now())
	} as Item);

export async function GET() {
	const feed = createFeed();
	const posts = await _getPublishedPosts();
	for (const post of posts) feed.addItem(postToFeedItem(post));
	return new Response(feed.rss2(), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8'
		}
	});
}
