export type Id = string;
export interface Identifiable {
	id: Id;
}

export interface P {
	x: number;
	y: number;
}

const abs = Math.abs;
const dx = (a: P, b: P) => abs(a.x - b.x);
const dy = (a: P, b: P) => abs(a.y - b.y);

export const dist = (a: P, b: P): number => dx(a, b) + dy(a, b);

export const elementPos = (e: HTMLElement): P => e.getBoundingClientRect() as P;

export const distElements = (a: HTMLElement, b: HTMLElement) => dist(elementPos(a), elementPos(b));

export const findClosestIdx = (p: P, pnts: P[]): number | undefined => {
	let d = Infinity,
		best: number | undefined = undefined;
	for (const [idx, o] of pnts.entries()) {
		const dt = dist(p, o);
		if (dt < d) (d = dt), (best = idx);
	}
	return best;
};

export const findIdx = <Item extends Identifiable>(arr: Item[], id: Id) =>
	arr.findIndex((item) => item.id === id);

export const moveByIdx = <T>(arr: T[], src: number, trg: number) =>
	arr.splice(trg, 0, arr.splice(src, 1)[0]);
