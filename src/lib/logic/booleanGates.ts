export type GateDesc = {
	id: number;
	label: string;
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
	{ label: '⊥', description: 'False' },
	{ label: '↓', description: 'Not Or' },
	{ label: 'x₁ ∧ ¬x₂' },
	{ label: '¬x₂', description: 'Negation' },
	{ label: '¬x₁ ∧ x₂' },
	{ label: '¬x₁', description: 'Negation' },
	{ label: '⊕', description: 'Exclusive Or' },
	{ label: '↑', description: 'Not And' },
	{ label: '∧', description: 'And' },
	{ label: '↔', description: 'Equality' },
	{ label: 'x₁', description: 'Identity' },
	{ label: 'x₂ → x₁', description: 'Implication' },
	{ label: 'x₂', description: 'Identity' },
	{ label: 'x₁ → x₂', description: 'Implication' },
	{ label: '∨', description: 'Or' },
	{ label: '⊤', description: 'True' }
].map((g, id) => ({
	...g,
	id: id,
	bits: idToBits(id, 4)
})) as GateDesc[];
