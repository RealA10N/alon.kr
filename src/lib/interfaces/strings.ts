import type { Identifiable } from '$lib/grabs/utils';

export type Stringable = string | number | bigint;

export interface BoxState<Text extends Stringable> extends Identifiable {
	text: Text;
	highlight?: boolean;
	color?: 'red' | 'green' | 'yellow';
}

export interface StringMatchingState {
	text: BoxState<string>[];
	pattern: BoxState<string>[];
	shift: number; // how much to shift the pattern (index in text)
	focus: number; // index of pattern to be at the center of the view
}
