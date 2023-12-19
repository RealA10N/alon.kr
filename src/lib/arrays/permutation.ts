// permutation of length n is represented as an array of elements [0, n-1].
export type Permutation = bigint[];

export const factorial = (n: bigint): bigint => (n <= 1n ? 1n : n * factorial(n - 1n));

export const permIdx = (permutation: Permutation, used: bigint[]): bigint => {
	// Returns the index of the permutation, which is a unique mapping of
	// every permutation of n elements into an integer in [0, n!).
	if (!permutation.length) return 0n;
	const first = permutation[0];
	const before = BigInt(used.filter((v) => v <= first).length);
	const w = factorial(BigInt(permutation.length) - 1n);
	const idx = w * (first - before);
	return idx + permIdx(permutation.slice(1), used.concat([first]));
};

export const idxToPerm = (idx: bigint, n: bigint): Permutation => {
	// Constructs a permutation from its index in range [0, n!).
	if (n === 0n) return [];
	const w = factorial(n - 1n);
	const first = idx / w;
	const tail = idxToPerm(idx % w, n - 1n);
	return [first].concat(tail.map((v) => (v >= first ? v + 1n : v)));
};

export const shuffle = <T>(array: T[]): T[] => {
	// Fisher–Yates shuffle
	array = [...array];
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
};
