export interface P {
	x: number;
	y: number;
}

const dx = (a: P, b: P) => a.x - b.x;
const dy = (a: P, b: P) => a.y - b.y;
const sq = (a: number) => a * a;

export const dist = (a: P, b: P): number => sq(dx(a, b)) + sq(dy(a, b));

export const elementPos = (e: HTMLElement): P => e.getBoundingClientRect() as P;

export const closestIdx = (e: HTMLElement, elements: HTMLElement[]): number | undefined => {
	const a = elementPos(e);
	let d = Infinity,
		best = undefined;
	for (const [i, elem] of elements.entries()) {
		const b = elementPos(elem);
		const dt = dist(a, b);
		if (dt < d) (d = dt), (best = i);
	}
	return best;
};
