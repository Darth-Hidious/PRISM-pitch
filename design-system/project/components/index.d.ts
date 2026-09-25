import type * as React from 'react';

type Node = React.ReactNode;
export type StatusTone = 'accent' | 'teal' | 'crimson' | 'neutral';
export type Maturity = 'in-use' | 'prototype' | 'development' | 'target';
export type Visibility = 'private' | 'computable' | 'released' | 'public';

export interface ButtonProps { children: Node; variant?: 'primary' | 'secondary' | 'link'; href?: string; external?: boolean; arrow?: boolean; onClick?: () => void; className?: string }
/** The one button. Primary at most once per view. */
export declare function Button(props: ButtonProps): React.ReactElement;

export interface KickerProps { children: Node; tone?: 'accent' | 'muted'; as?: 'p' | 'span' | 'h2' | 'h3'; className?: string }
/** Wide-tracked caps label above a headline. */
export declare function Kicker(props: KickerProps): React.ReactElement;

export interface StatusPillProps { children: Node; tone?: StatusTone }
/** One or two words of programme status. */
export declare function StatusPill(props: StatusPillProps): React.ReactElement;

export interface MaturityPillProps { maturity: Maturity }
/** In use, Prototype, In development or Target. */
export declare function MaturityPill(props: MaturityPillProps): React.ReactElement;

export interface StatProps { value: Node; label: Node; note?: Node; size?: 'md' | 'lg' }
/** A figure with its label. */
export declare function Stat(props: StatProps): React.ReactElement;

export interface ChainStep { label: Node; detail?: Node }
export interface ProcessChainProps { steps: ChainStep[]; emphasizeLast?: boolean; loop?: Node; label?: string }
/** Numbered steps joined by connectors; the last is filled. */
export declare function ProcessChain(props: ProcessChainProps): React.ReactElement;

export interface TimelineItem { date?: Node; title: Node; detail?: Node; state?: 'done' | 'current' | 'next' }
export interface TimelineProps { items: TimelineItem[]; label?: string }
/** Dated events on one rule; the current item is crimson. */
export declare function Timeline(props: TimelineProps): React.ReactElement;

export interface StatusRow { entity: Node; entityNote?: Node; status: { label: string; tone: StatusTone }; statement: Node[] }
export interface StatusTableProps { rows: StatusRow[]; columns?: [string, string, string] }
/** Who, how far along, what exists today. */
export declare function StatusTable(props: StatusTableProps): React.ReactElement;

export interface SourceLineProps { children: Node; label?: string }
/** Where a figure or image comes from. */
export declare function SourceLine(props: SourceLineProps): React.ReactElement;

export interface FooterBandProps { left?: Node; middle?: Node; right?: Node }
/** The navy band along the foot of every slide. */
export declare function FooterBand(props: FooterBandProps): React.ReactElement;

export interface StackLayer { name: Node; detail: Node; maturity: Maturity }
export interface CapabilityStackProps { layers: StackLayer[]; label?: string }
/** The platform as layers, each with its maturity. */
export declare function CapabilityStack(props: CapabilityStackProps): React.ReactElement;

export interface RightsStateProps { state: Visibility; label?: string }
/** Private, Computable, Released or Public, with its glyph. */
export declare function RightsState(props: RightsStateProps): React.ReactElement;

export interface ObjectCardProps { type: string; title: Node; id?: string; properties?: [string, Node][]; state?: Visibility; emphasis?: boolean }
/** One object of the PRISM ontology. */
export declare function ObjectCard(props: ObjectCardProps): React.ReactElement;

export interface LineageNode { type: string; title: string; state?: Visibility }
export interface EvidenceLineageProps { nodes: LineageNode[]; links: string[]; label?: string }
/** A decision walked back to its requirement, each link named. */
export declare function EvidenceLineage(props: EvidenceLineageProps): React.ReactElement;

export type ManifestValue = string | { allow: string } | { deny: string };
export interface RightsManifestProps { rows: [string, ManifestValue][]; caption?: string; note?: string }
/** Machine-readable rights that travel with evidence. */
export declare function RightsManifest(props: RightsManifestProps): React.ReactElement;

export interface WindowPlotProps { xLabel?: string; yLabel?: string; label?: string; caption?: string }
/** The manufacturing window. Conceptual only. */
export declare function WindowPlot(props: WindowPlotProps): React.ReactElement;

export interface PaintingProps {
    src?: string;
    source?: (width: number, height: number) => HTMLCanvasElement;
    alt: string;
    seed?: number;
    direction?: number;
    motion?: number;
    detail?: number;
    focusX?: number;
    focusY?: number;
    animate?: boolean;
    className?: string;
    style?: React.CSSProperties;
}
/** A photograph or code-drawn scene repainted as brush strokes. */
export declare function Painting(props: PaintingProps): React.ReactElement;

export interface MirdyneMarkProps { className?: string; style?: React.CSSProperties; title?: string }
/** The Mirdyne mark in currentColor. */
export declare function MirdyneMark(props: MirdyneMarkProps): React.ReactElement;

declare global {
    interface Window {
        Prism: {
            Button: typeof Button; Kicker: typeof Kicker; StatusPill: typeof StatusPill; MaturityPill: typeof MaturityPill;
            Stat: typeof Stat; ProcessChain: typeof ProcessChain; Timeline: typeof Timeline; StatusTable: typeof StatusTable;
            SourceLine: typeof SourceLine; FooterBand: typeof FooterBand; CapabilityStack: typeof CapabilityStack;
            RightsState: typeof RightsState; ObjectCard: typeof ObjectCard; EvidenceLineage: typeof EvidenceLineage;
            RightsManifest: typeof RightsManifest; WindowPlot: typeof WindowPlot; Painting: typeof Painting; MirdyneMark: typeof MirdyneMark;
        };
    }
}
