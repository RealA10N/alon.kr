import moment from 'moment';

export interface Post {
	title: string;
	description: string;
	url: string;
	published: number;
	length: number;
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
	`${post.length} min read`,
	...post.tags
];
