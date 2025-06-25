const subscripts = '₀₁₂₃₄₅₆₇₈₉';
export const toSubscript = (n: number): string =>
	n === 0 ? '' : toSubscript(Math.floor(n / 10)) + subscripts[n % 10];
