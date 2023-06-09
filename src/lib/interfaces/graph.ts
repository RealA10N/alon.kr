import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';

export interface Edge extends SimulationLinkDatum<Vertex> {
	// includes 'source', 'target' from SimulationLinkDatum.
	highlight?: boolean;
	weight?: number;
}

export interface Vertex extends SimulationNodeDatum {
	label?: string | number;
	highlight?: boolean;
}

export enum GraphMode {
	static,
	sticky,
	regular
}
