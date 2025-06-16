import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';
import type { Color } from '$lib/interfaces/color';

export interface Edge extends SimulationLinkDatum<Vertex> {
	// includes 'source', 'target' from SimulationLinkDatum.
	color?: Color;
	label?: number | string;
	highlight?: boolean; // should the edge be bolder
	direction?: boolean; // is the edge directed?
}

export interface Vertex extends SimulationNodeDatum {
	id: number;
	color?: Color;
	label?: string | number;
	highlight?: boolean;
}

export enum GraphMode {
	static,
	sticky,
	regular
}
