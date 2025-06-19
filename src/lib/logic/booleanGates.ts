export type GateDesc = {
	id: number;
	name: string;
	description?: string;
	bits: boolean[];
};

export const idToBits = (n: number, len: number) =>
	Array.from({ length: len }, (_, i) => (n & (1 << i)) !== 0);

export const bitsToId = (bits: boolean[]) =>
	bits.reduce((acc, bit, i) => acc | (bit ? 1 << i : 0), 0);

// Those are all the 16 possible gates with 2 inputs and 1 output, each with
// an explicit name and description.
export const BooleanGates = [
	{ name: '⊥', description: 'False', focus: true },
	{ name: '↓', description: 'Not Or' },
	{ name: 'x₁ ∧ ¬x₂' },
	{ name: '¬x₂', description: 'Negation' },
	{ name: '¬x₁ ∧ x₂' },
	{ name: '¬x₁', description: 'Negation' },
	{ name: '⊕', description: 'Exclusive Or' },
	{ name: '↑', description: 'Not And' },
	{ name: '∧', description: 'And' },
	{ name: '↔', description: 'Equality' },
	{ name: 'x₁', description: 'Identity' },
	{ name: 'x₂ → x₁', description: 'Implication' },
	{ name: 'x₂', description: 'Identity' },
	{ name: 'x₁ → x₂', description: 'Implication' },
	{ name: '∨', description: 'Or' },
	{ name: '⊤', description: 'True' }
].map((g, id) => ({
	...g,
	id: id,
	bits: idToBits(id, 4)
})) as GateDesc[];
