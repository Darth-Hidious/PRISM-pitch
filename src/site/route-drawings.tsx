/**
 * The drawn steps of the home page's row (Made.tsx), in the engraved style of engrave.tsx: the design
 * steps before any metal (the requirement, the literature, the classes of material, the generative
 * models, the few chosen), and one step of the making route that no free photograph shows well, metal
 * built up by DED, which is animated.
 *
 * The motion is SVG animation (SMIL), which moves line ends and clip widths that CSS cannot. It is left
 * out altogether where motion is unwelcome, which leaves a complete still frame, and it is paused while
 * a drawing is off screen.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { Requirement, Design, Screen } from './diagrams';
import { Ball, Defs, T } from './engrave';
import { useReducedMotion } from './hooks';
import { useT } from './i18n';

/** A drawing that runs its animations only while on screen. */
function Drawing({ id, label, children, viewBox = '0 0 300 300' }: { id: string; label: string; children: ReactNode; viewBox?: string }) {
    const ref = useRef<SVGSVGElement>(null);
    useEffect(() => {
        const svg = ref.current;
        if (!svg || typeof svg.pauseAnimations !== 'function') return;
        svg.pauseAnimations();
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations()));
        io.observe(svg);
        return () => io.disconnect();
    }, []);
    return (
        <svg ref={ref} className="eg route" viewBox={viewBox} role="img" aria-label={label}>
            <Defs id={id} />
            {children}
        </svg>
    );
}

/** A nozzle blows powder into a laser's focus and lays the part down bead by bead. */
export function DedDrawing() {
    const t = useT();
    const motion = !useReducedMotion();
    const rows = [238, 226, 214, 202];
    // The nozzle lays one bead left to right with the laser on, then travels back with it off.
    const move = { values: '0 0; 140 0; 140 0; 0 0', keyTimes: '0; 0.76; 0.84; 1' };
    const lit = { values: '1; 1; 0; 0', keyTimes: '0; 0.76; 0.78; 1' };
    return (
        <Drawing id="route-ded" label={t('A nozzle blows metal powder into a laser beam and builds the part up, bead by bead.')}>
            <defs>
                <clipPath id="route-ded-bead">
                    <rect x={92} y={186} width={motion ? 12 : 82} height={18}>
                        {motion && <animate attributeName="width" values="12; 152; 152; 152" keyTimes={move.keyTimes} dur="3.4s" repeatCount="indefinite" />}
                    </rect>
                </clipPath>
            </defs>
            {/* The plate, and the wall built so far, bead on bead */}
            <rect className="eg-fill" fill="url(#route-ded-hatch)" x={24} y={250} width={252} height={14} />
            <rect className="eg-frame" x={24} y={250} width={252} height={14} />
            {rows.map((y) => (
                <rect key={y} className="eg-solid" x={92} y={y} width={164} height={12} rx={6} />
            ))}
            <rect className="eg-solid route-bead" x={92} y={190} width={164} height={12} rx={6} clipPath="url(#route-ded-bead)">
                {motion && <animate attributeName="opacity" values="1; 1; 1; 0" keyTimes={move.keyTimes} dur="3.4s" repeatCount="indefinite" />}
            </rect>
            <T x={84} y={230} kind="small" anchor="end">
                {t('part')}
            </T>
            {/* The nozzle, with its laser and the two jets of powder meeting at the melt pool */}
            <g transform={motion ? undefined : 'translate(70 0)'}>
                {motion && <animateTransform attributeName="transform" type="translate" values={move.values} keyTimes={move.keyTimes} dur="3.4s" repeatCount="indefinite" />}
                <path className="eg-line" d="M104,40 V92" />
                <T x={112} y={60} kind="small" anchor="start">
                    {t('laser')}
                </T>
                <g>
                    {motion && <animate attributeName="opacity" values={lit.values} keyTimes={lit.keyTimes} dur="3.4s" repeatCount="indefinite" />}
                    <line className="route-beam" x1={104} y1={100} x2={104} y2={191} />
                    <line className="eg-line eg-line--trail route-jet" x1={96} y1={172} x2={104} y2={190} />
                    <line className="eg-line eg-line--trail route-jet" x1={112} y1={172} x2={104} y2={190} />
                    <ellipse className="route-heat" cx={104} cy={192} rx={6} ry={3} />
                </g>
                <path className="eg-solid" d="M80,92 H128 L114,170 H94 Z" />
                <path className="eg-fill" fill="url(#route-ded-fine)" d="M84,92 H93 L99,170 H94 Z" />
                <path className="eg-line eg-line--thin" d="M74,124 H89" />
                <T x={70} y={129} kind="small" anchor="end">
                    {t('powder')}
                </T>
            </g>
        </Drawing>
    );
}

/* ── The design steps, before any metal ───────────────────────────────── */

/* The drawings of the procedure diagram sit around x = 150; each frame below fits its tile to one. */

/** A specification sheet and a thermometer: what the part must survive. */
export function RequirementDrawing() {
    const t = useT();
    return (
        <Drawing id="route-req" viewBox="70 100 166 166" label={t('A specification sheet beside a thermometer: what the part must survive.')}>
            <g transform="translate(6 0)">
                <Requirement px={150} />
            </g>
        </Drawing>
    );
}

/** A stack of papers under a magnifying glass. */
export function LiteratureDrawing() {
    const t = useT();
    return (
        <Drawing id="route-lit" viewBox="60 92 186 186" label={t('A stack of papers under a magnifying glass: the literature on the requirement.')}>
            {[16, 8, 0].map((o) => (
                <rect key={o} className="eg-solid" x={76 + o} y={108 + o} width={104} height={136} rx={3} />
            ))}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
                <line key={k} className="eg-line eg-line--thin" x1={106} y1={144 + k * 12} x2={106 + (k % 3 === 2 ? 44 : 66)} y2={144 + k * 12} />
            ))}
            <circle className="eg-solid eg-solid--open" cx={184} cy={206} r={32} />
            <circle className="eg-line eg-line--thin" cx={184} cy={206} r={25} />
            <line className="eg-line eg-line--bold" x1={207} y1={229} x2={232} y2={256} />
        </Drawing>
    );
}

/** Classes of material, as tags; the ones worth researching are filled in. */
export function ClassesDrawing() {
    const t = useT();
    const rows: [number, boolean, 'white' | 'light' | 'mid' | 'dark'][] = [
        [118, false, 'light'],
        [158, true, 'white'],
        [198, true, 'mid'],
        [238, false, 'dark'],
    ];
    return (
        <Drawing id="route-cls" viewBox="66 84 196 196" label={t('Four classes of material as tags; the two worth researching are marked.')}>
            {rows.map(([y, chosen, tone]) => (
                <g key={y}>
                    <rect className={chosen ? 'eg-solid' : 'eg-line eg-line--dashed'} x={80} y={y - 15} width={140} height={30} rx={15} />
                    <Ball cx={100} cy={y} r={7} tone={tone} />
                    <line className="eg-line eg-line--thin" x1={116} y1={y} x2={chosen ? 190 : 170} y2={y} />
                    {chosen && <path className="eg-line eg-line--bold" d={`M${228},${y} l7,7 l13,-15`} />}
                </g>
            ))}
        </Drawing>
    );
}

/** The generative models' search: many recipes spread over a three-metal triangle. */
export function GenerateDrawing() {
    const t = useT();
    return (
        <Drawing id="route-gen" viewBox="46 86 208 208" label={t('A triangle of three metals with many recipes proposed across it: the generative models at work.')}>
            <Design px={150} />
        </Drawing>
    );
}

/** A landscape of the physics: most ideas roll out, the best settle in the deepest valley. */
export function ChooseDrawing() {
    const t = useT();
    return (
        <Drawing id="route-cho" viewBox="60 96 180 180" label={t('A landscape of the physics: most ideas fall away and the best few settle in its deepest valley.')}>
            <Screen px={150} id="route-cho" />
        </Drawing>
    );
}
