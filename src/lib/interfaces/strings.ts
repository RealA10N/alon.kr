import type { Identifiable } from '$lib/grabs/utils';

export type Text = string | number | bigint;

export interface BoxState extends Identifiable {
	text: Text;
	highlight?: boolean;
	color?: 'red' | 'green' | 'yellow';
}

export interface StringMatchingState {
	text: BoxState[];
	pattern: BoxState[];
	shift: number; // how much to shift the pattern (index in text)
	focus: number; // index of pattern to be at the center of the view
}
