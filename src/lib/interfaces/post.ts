import moment from 'moment';
import type { ReadTimeResults } from 'reading-time';

export interface Post {
	title: string;
	description: string;
	url: string;
	published?: number;
	readingTime: ReadTimeResults;
	tags: string[];
}

const formatDuration = (dateUnix: number, specific: boolean) => {
	const date = moment(dateUnix);
	const duration = moment.duration(moment().diff(date));
	return duration.months() >= 11 || specific ? date.format('MMM Do YYYY') : date.fromNow();
};

export const countWords = (element: HTMLElement) =>
	Math.ceil(element.innerText.split(' ').length / 200);

export const toTaglist = (post: Post, specific: boolean = false): string[] => [
	formatDuration(post.published, specific),
	`${post.readingTime.text}`,
	...post.tags
];
