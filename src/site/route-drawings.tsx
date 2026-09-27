/**
 * A step of the making route that no free photograph shows well, drawn in the engraved style of
 * engrave.tsx and animated: metal built up by DED. It sits among the photographs in the home page's row
 * (Made.tsx).
 *
 * The motion is SVG animation (SMIL), which moves line ends and clip widths that CSS cannot. It is left
 * out altogether where motion is unwelcome, which leaves a complete still frame, and it is paused while
 * a drawing is off screen.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { Defs, T } from './engrave';
import { useReducedMotion } from './hooks';
import { useT } from './i18n';

/** A drawing that runs its animations only while on screen. */
function Drawing({ id, label, children }: { id: string; label: string; children: ReactNode }) {
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
        <svg ref={ref} className="eg route" viewBox="0 0 300 300" role="img" aria-label={label}>
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
