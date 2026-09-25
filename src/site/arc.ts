const rad = (d: number) => (d * Math.PI) / 180;
const f = (n: number) => n.toFixed(2);

/** An SVG path for an arc of a circle from angle a0 to a1 in degrees (SVG y points down). */
export function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
    const x0 = cx + r * Math.cos(rad(a0));
    const y0 = cy + r * Math.sin(rad(a0));
    const x1 = cx + r * Math.cos(rad(a1));
    const y1 = cy + r * Math.sin(rad(a1));
    return `M${f(x0)},${f(y0)} A${f(r)},${f(r)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f(x1)},${f(y1)}`;
}
