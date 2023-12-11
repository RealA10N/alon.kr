export interface StringMatchingState {
	text: string;
	pattern: string;
	shift: number;
	comparing: number;
	highlight?: number;
	mark?: {
		text?: number[];
		pattern?: number[];
	};
}

export enum StringCompare {
	NotCompared = 'not-compared',
	Matching = 'matching',
	NotMatching = 'not-matching'
}
