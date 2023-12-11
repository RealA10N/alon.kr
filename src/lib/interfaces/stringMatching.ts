export interface LetterState {
	text: string;
	mode: LetterMode;
	highlight?: boolean;
}

export interface StringMatchingState {
	text: LetterState[];
	pattern: LetterState[];
	shift: number; // how much to shift the pattern (index in text)
	focus: number; // index of pattern to be at the center of the view
}

export enum LetterMode {
	Regular = 'regular',
	Matching = 'matching',
	NotMatching = 'not-matching',
	Marked = 'marked'
}
