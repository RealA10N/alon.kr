export type GateDesc = {
	id: number;
	label: string;
	usage: string;
	description: string;
	bits: boolean[];
};

export const idToBits = (n: number, len: number) =>
	Array.from({ length: len }, (_, i) => (n & (1 << i)) !== 0);

export const bitsToId = (bits: boolean[]) =>
	bits.reduce((acc, bit, i) => acc | (bit ? 1 << i : 0), 0);

// Those are all the 16 possible gates with 2 inputs and 1 output, each with
// an explicit name and description.
export const BooleanGates = [
	{ label: '⊥', usage: '⊥', description: 'False' },
	{ label: '↓', usage: 'x₁ ↓ x₂', description: 'Not Or' },
	{ label: '↛', usage: 'x₁ ↛ x₂', description: 'Not Implication' },
	{ label: '¬x₂', usage: '¬x₂', description: 'Negation' },
	{ label: '↚', usage: 'x₁ ↚ x₂', description: 'Not Implication' },
	{ label: '¬x₁', usage: '¬x₁', description: 'Negation' },
	{ label: '⊕', usage: 'x₁ ⊕ x₂', description: 'Exclusive Or' },
	{ label: '↑', usage: 'x₁ ↑ x₂', description: 'Not And' },
	{ label: '∧', usage: 'x₁ ∧ x₂', description: 'And' },
	{ label: '↔', usage: 'x₁ ↔ x₂', description: 'Equivalence' },
	{ label: 'x₁', usage: 'x₁', description: 'Identity' },
	{ label: '←', usage: 'x₁ ← x₂', description: 'Implication' },
	{ label: 'x₂', usage: 'x₂', description: 'Identity' },
	{ label: '→', usage: 'x₁ → x₂', description: 'Implication' },
	{ label: '∨', usage: 'x₁ ∨ x₂', description: 'Or' },
	{ label: '⊤', usage: '⊤', description: 'True' }
].map((g, id) => ({
	...g,
	id: id,
	bits: idToBits(id, 4)
})) as GateDesc[];
