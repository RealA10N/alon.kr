import katex from 'katex';

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

const renderKaTeX = (str: string) =>
	str.replace(/\$([^$]+)\$/g, (_, mathContent) => {
		return katex.renderToString(mathContent.trim(), {
			throwOnError: false,
			displayMode: false
		});
	});

// Those are all the 16 possible gates with 2 inputs and 1 output, each with
// an explicit name and description.
export const BooleanGates = [
	{ label: '$\\bot$', usage: '$\\bot$', description: 'False' },
	{ label: '$\\downarrow$', usage: 'x₁ $\\downarrow$ x₂', description: 'Not Or' },
	{ label: '$\\nrightarrow$', usage: 'x₁ $\\nrightarrow$ x₂', description: 'Not Implication' },
	{ label: '$\\neg$ x₂', usage: '$\\neg$ x₂', description: 'Negation' },
	{ label: '$\\nleftarrow$', usage: 'x₁ $\\nleftarrow$ x₂', description: 'Not Implication' },
	{ label: '$\\neg$ x₁', usage: '$\\neg$ x₁', description: 'Negation' },
	{ label: '$\\oplus$', usage: 'x₁ $\\oplus$ x₂', description: 'Exclusive Or' },
	{ label: '$\\uparrow$', usage: 'x₁ $\\uparrow$ x₂', description: 'Not And' },
	{ label: '$\\land$', usage: 'x₁ $\\land$ x₂', description: 'And' },
	{ label: '$\\leftrightarrow$', usage: 'x₁ $\\leftrightarrow$ x₂', description: 'Equivalence' },
	{ label: 'x₁', usage: 'x₁', description: 'Identity' },
	{ label: '$\\leftarrow$', usage: 'x₁ $\\leftarrow$ x₂', description: 'Implication' },
	{ label: 'x₂', usage: 'x₂', description: 'Identity' },
	{ label: '$\\rightarrow$', usage: 'x₁ $\\rightarrow$ x₂', description: 'Implication' },
	{ label: '$\\lor$', usage: 'x₁ $\\lor$ x₂', description: 'Or' },
	{ label: '$\\top$', usage: '$\\top$', description: 'True' }
].map((g, id) => ({
	label: renderKaTeX(g.label),
	usage: renderKaTeX(g.usage),
	description: g.description,
	id: id,
	bits: idToBits(id, 4)
})) as GateDesc[];
