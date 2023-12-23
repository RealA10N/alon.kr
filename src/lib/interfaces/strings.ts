import type { Identifiable } from '$lib/grabs/utils';
import type { Color } from '$lib/interfaces/color';

export type Stringable = string | number | bigint;

export interface BoxState<Text extends Stringable> extends Identifiable {
	text: Text;
	highlight?: boolean;
	color?: Color;
}

export interface StringMatchingState {
	text: BoxState<string>[];
	pattern: BoxState<string>[];
	shift: number; // how much to shift the pattern (index in text)
	focus: number; // index of pattern to be at the center of the view
}
