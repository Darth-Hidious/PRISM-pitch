/**
 * The steps from a milled alloy to a tested coupon that we have no photographs of yet, drawn in the
 * engraved style of engrave.tsx and animated: the chips milled into powder, the powder printed in a
 * powder bed or built up by DED, and the coupons checked for flaws. They follow the photographs in the
 * home page's row (Made.tsx).
 *
 * The motion is SVG animation (SMIL), which moves line ends and clip widths that CSS cannot. It is left
 * out altogether where motion is unwelcome, which leaves a complete still frame, and it is paused while
 * a drawing is off screen.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { Ball, Defs, T } from './engrave';
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
            <defs>
                <pattern id={`${id}-dots`} width="6" height="6" patternUnits="userSpaceOnUse">
                    <circle className="eg-dot" cx="3" cy="3" r="1.3" />
                </pattern>
            </defs>
            {children}
        </svg>
    );
}

/** Chips fall into a ball mill, tumble, and come out as fine, round powder. */
export function PowderDrawing() {
    const t = useT();
    const motion = !useReducedMotion();
    const heap: [number, number][] = [];
    [9, 7, 5, 3, 1].forEach((count, row) => {
        for (let k = 0; k < count; k++) heap.push([150 + (k - (count - 1) / 2) * 13, 262 - row * 11]);
    });
    const chips = [
        { x: 132, y: 22, d: 0 },
        { x: 166, y: 16, d: 0.9 },
        { x: 150, y: 34, d: 1.8 },
    ];
    // The balls inside the mill's drum, which turns while the machine runs.
    const charge = [0, 120, 240].map((a) => ({ x: 150 + 11 * Math.cos((a * Math.PI) / 180), y: 140 + 11 * Math.sin((a * Math.PI) / 180) }));
    return (
        <Drawing id="route-powder" label={t('Metal chips go into a mill and come out as fine, round powder.')}>
            {chips.map((c, k) => (
                <g key={k} transform={`translate(${c.x} ${c.y})`}>
                    <path className="eg-line" d="M-9,3 C-7,-6 5,-8 8,-1 C9,3 5,6 1,4">
                        {motion && (
                            <>
                                <animateTransform attributeName="transform" type="translate" values="0 0; 0 50" dur="2.7s" begin={`${c.d}s`} repeatCount="indefinite" />
                                <animate attributeName="opacity" values="1; 1; 0" keyTimes="0; 0.7; 1" dur="2.7s" begin={`${c.d}s`} repeatCount="indefinite" />
                            </>
                        )}
                    </path>
                </g>
            ))}
            <T x={112} y={30} kind="small" anchor="end">
                {t('chips')}
            </T>
            {/* The hopper, the mill's body with its drum, and the spout below */}
            <path className="eg-solid" d="M98,70 H202 L166,108 H134 Z" />
            <path className="eg-fill" fill="url(#route-powder-fine)" d="M98,70 H112 L142,108 H134 Z" />
            <rect className="eg-solid" x={104} y={108} width={92} height={64} rx={3} />
            <rect className="eg-fill" fill="url(#route-powder-hatch)" x={104} y={108} width={12} height={64} />
            <rect className="eg-frame" x={104} y={108} width={92} height={64} rx={3} />
            <circle className="eg-solid" cx={150} cy={140} r={21} />
            <g>
                {motion && <animateTransform attributeName="transform" type="rotate" from="0 150 140" to="360 150 140" dur="2.4s" repeatCount="indefinite" />}
                <circle className="eg-line eg-line--thin" cx={150} cy={140} r={17} strokeDasharray="3 4" />
                {charge.map((b, k) => (
                    <Ball key={k} cx={b.x} cy={b.y} r={4.2} tone="mid" />
                ))}
            </g>
            <path className="eg-solid" d="M143,172 H157 V182 H143 Z" />
            {[0, 0.3, 0.6, 0.9, 1.2].map((d, k) => (
                <g key={k} opacity={motion ? 0 : k === 2 ? 1 : 0}>
                    <Ball cx={150} cy={190} r={4.6} tone="white" />
                    {motion && (
                        <>
                            <animateTransform attributeName="transform" type="translate" values="0 0; 0 24" dur="1.5s" begin={`${d}s`} repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.1; 0.85; 1" dur="1.5s" begin={`${d}s`} repeatCount="indefinite" />
                        </>
                    )}
                </g>
            ))}
            {heap.map(([x, y], k) => (
                <Ball key={k} cx={x} cy={y} r={6} tone={k % 4 === 1 ? 'light' : 'white'} />
            ))}
            <path className="eg-line" d="M52,270 H248" />
            <T x={222} y={248} kind="small" anchor="start">
                {t('powder')}
            </T>
        </Drawing>
    );
}

/** A laser melts the top layer of the part into a bed of powder; a blade spreads the next layer. */
export function PbfDrawing() {
    const t = useT();
    const motion = !useReducedMotion();
    // The beam hatches the layer back and forth, then goes dark while the blade spreads fresh powder.
    const scan = { values: '122; 178; 122; 178; 150; 150', keyTimes: '0; 0.2; 0.4; 0.6; 0.7; 1' };
    const lit = { values: '1; 1; 0; 0', keyTimes: '0; 0.66; 0.68; 1' };
    return (
        <Drawing id="route-pbf" label={t('A laser melts each layer of the part into a bed of metal powder; a blade then spreads the next layer.')}>
            {/* The laser's scanner, and its beam down to the top of the part */}
            <rect className="eg-solid" x={130} y={30} width={40} height={22} rx={2} />
            <rect className="eg-fill" fill="url(#route-pbf-fine)" x={130} y={30} width={9} height={22} />
            <T x={122} y={46} kind="small" anchor="end">
                {t('laser')}
            </T>
            <line className="route-beam" x1={150} y1={52} x2={150} y2={168}>
                {motion && (
                    <>
                        <animate attributeName="x2" values={scan.values} keyTimes={scan.keyTimes} dur="4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values={lit.values} keyTimes={lit.keyTimes} dur="4s" repeatCount="indefinite" />
                    </>
                )}
            </line>
            {/* The machine's table, the powder bed in it, the part in the bed, and the build plate below */}
            <path className="eg-line" d="M18,168 H70 M230,168 H282" />
            <rect className="eg-fill" fill="url(#route-pbf-dots)" x={70} y={168} width={160} height={84} />
            <rect className="eg-solid" x={116} y={168} width={68} height={84} />
            <rect className="eg-fill" fill="url(#route-pbf-layers)" x={116} y={168} width={68} height={84} />
            <rect className="eg-frame" x={116} y={168} width={68} height={84} />
            <rect className="eg-fill" fill="url(#route-pbf-hatch)" x={70} y={252} width={160} height={12} />
            <rect className="eg-frame" x={70} y={252} width={160} height={12} />
            <path className="eg-line" d="M150,264 V284 M132,284 H168" />
            <path className="eg-line eg-line--bold" d="M70,168 V284 M230,168 V284" />
            <ellipse className="route-heat" cx={150} cy={168} rx={6} ry={3}>
                {motion && (
                    <>
                        <animate attributeName="cx" values={scan.values} keyTimes={scan.keyTimes} dur="4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values={lit.values} keyTimes={lit.keyTimes} dur="4s" repeatCount="indefinite" />
                    </>
                )}
            </ellipse>
            {/* The blade that spreads each new layer of powder, from its rest on the table and back */}
            <g>
                <rect className="eg-solid eg-solid--top" x={30} y={154} width={14} height={13} rx={1.5} />
                <path className="eg-line eg-line--trail" d="M46,166 H58" />
                {motion && <animateTransform attributeName="transform" type="translate" values="0 0; 0 0; 214 0; 0 0" keyTimes="0; 0.68; 0.86; 1" dur="4s" repeatCount="indefinite" />}
            </g>
            <path className="eg-line eg-line--thin" d="M62,212 H96" />
            <T x={58} y={217} kind="small" anchor="end">
                {t('powder')}
            </T>
            <path className="eg-line eg-line--thin" d="M234,212 H166" />
            <T x={238} y={217} kind="small" anchor="start">
                {t('part')}
            </T>
        </Drawing>
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

/** Coupons on the build plate; a scan passes through one and rings each flaw it finds. */
export function CouponDrawing() {
    const t = useT();
    const motion = !useReducedMotion();
    const coupons = [62, 106, 150, 194, 238];
    const pores = [
        { x: 132, y: 78 },
        { x: 176, y: 110 },
        { x: 140, y: 130 },
    ];
    // The scan sweeps down through the cut face in the first three quarters, then rests.
    const top = 44;
    const bottom = 156;
    const sweep = 0.75;
    const found = (y: number) => (sweep * (y - top)) / (bottom - top);
    return (
        <Drawing id="route-coupon" label={t('Test coupons on the build plate; a scan looks inside one and finds the flaws.')}>
            <defs>
                <clipPath id="route-coupon-lens">
                    <circle cx={150} cy={100} r={56} />
                </clipPath>
            </defs>
            {/* The plate and the coupons printed on it */}
            <rect className="eg-fill" fill="url(#route-coupon-hatch)" x={28} y={250} width={244} height={14} />
            <rect className="eg-frame" x={28} y={250} width={244} height={14} />
            {coupons.map((x) => (
                <g key={x}>
                    <path className="eg-solid" d={`M${x - 13},208 V250 H${x + 13} V208`} />
                    <rect className="eg-fill" fill="url(#route-coupon-layers)" x={x - 13} y={208} width={26} height={42} />
                    <rect className="eg-fill" fill="url(#route-coupon-fine)" x={x + 5} y={208} width={8} height={42} />
                    <path className="eg-line" d={`M${x - 13},208 V250 M${x + 13},208 V250`} />
                    <ellipse className="eg-solid eg-solid--top" cx={x} cy={208} rx={13} ry={4} />
                </g>
            ))}
            <T x={30} y={196} kind="small" anchor="start">
                {t('coupons')}
            </T>
            {/* The look inside the middle coupon: its cut face, with grains and a few pores */}
            <path className="eg-line eg-line--dashed" d="M112,141 L137,205 M188,141 L163,205" />
            <circle className="eg-solid" cx={150} cy={100} r={56} />
            <g clipPath="url(#route-coupon-lens)">
                <path
                    className="eg-line eg-line--thin"
                    d="M94,70 L122,76 L136,52 M122,76 L126,104 L100,114 M126,104 L156,96 L166,62 L150,44 M156,96 L172,124 L206,118 M172,124 L160,156 M126,104 L118,140 L94,146 M166,62 L206,78 M118,140 L150,156"
                />
                {pores.map((p, k) => (
                    <circle key={k} className="eg-point" cx={p.x} cy={p.y} r={2.4} />
                ))}
                <line className="route-scan" x1={90} y1={motion ? top : 146} x2={210} y2={motion ? top : 146}>
                    {motion && (
                        <>
                            <animate attributeName="y1" values={`${top}; ${bottom}; ${bottom}`} keyTimes={`0; ${sweep}; 1`} dur="4s" repeatCount="indefinite" />
                            <animate attributeName="y2" values={`${top}; ${bottom}; ${bottom}`} keyTimes={`0; ${sweep}; 1`} dur="4s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1; 1; 0; 0" keyTimes={`0; ${sweep}; ${sweep + 0.05}; 1`} dur="4s" repeatCount="indefinite" />
                        </>
                    )}
                </line>
            </g>
            <circle className="eg-frame" cx={150} cy={100} r={56} />
            {pores.map((p, k) => (
                <circle key={k} className="route-found" cx={p.x} cy={p.y} r={7} opacity={motion ? 0 : 1}>
                    {motion && (
                        <animate
                            attributeName="opacity"
                            values="0; 0; 1; 1; 0"
                            keyTimes={`0; ${found(p.y).toFixed(3)}; ${(found(p.y) + 0.02).toFixed(3)}; 0.94; 1`}
                            dur="4s"
                            repeatCount="indefinite"
                        />
                    )}
                </circle>
            ))}
            <path className="eg-line eg-line--thin" d="M184,110 H224" />
            <T x={228} y={114} kind="small" anchor="start">
                {t('flaw')}
            </T>
        </Drawing>
    );
}
