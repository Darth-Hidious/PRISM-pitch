import type { CSSProperties } from 'react';

/**
 * PRISM Alpha, the ESA-funded project built around the full PRISM loop: who is in it and what each
 * partner does. Logos are the partners' own artwork, shown in one colour (the text colour around them).
 */
export const CONSORTIUM = [
    { id: 'esa', name: 'European Space Agency', role: 'Customer and funder', logo: '/partners/esa.svg', ratio: 88.928 / 32, size: 0.95 },
    { id: 'bimo', name: 'Bimo Tech', role: 'Prime contractor', logo: '/partners/bimo-tech.png', ratio: 363 / 132, size: 1.05 },
    { id: 'ariane', name: 'ArianeGroup', role: 'Requirements and validation', logo: '/partners/arianegroup.svg', ratio: 6, size: 0.8 },
    { id: 'iapt', name: 'Fraunhofer IAPT', role: 'Metal 3D printing', logo: '/partners/fraunhofer-iapt.png', ratio: 3.6, size: 1.2 },
    { id: 'amsight', name: 'amsight', role: 'Manufacturing data', logo: '/partners/amsight.svg', ratio: 102 / 24, size: 0.85 },
] as const;

export type Partner = (typeof CONSORTIUM)[number];

/** A partner's logo in the surrounding text colour. `size` evens out how large each one looks. */
export function PartnerLogo({ p }: { p: Partner }) {
    return (
        <span
            className="plogo"
            role="img"
            aria-label={p.name}
            style={{ '--src': `url(${p.logo})`, '--ratio': p.ratio, '--size': p.size } as CSSProperties}
        />
    );
}
