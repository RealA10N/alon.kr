export const calcpi = (pattern: string): number[] => {
	const pi: number[] = [0];
	let k = 0;

	for (let i = 1; i < pattern.length; i++) {
		while (k > 0 && pattern.charAt(k) !== pattern.charAt(i)) k = pi[k - 1];
		if (pattern.charAt(k) === pattern.charAt(i)) k++;
		pi[i] = k;
	}

	return pi;
};
