import type { ReactNode } from 'react';
import MirdyneMark from './MirdyneMark';

/**
 * The navy band along the foot of every slide: company left, programme line
 * centre, position right. `left` replaces the default mark and name.
 */
export default function FooterBand({
    left,
    middle = 'PRISM  ·  Freedom to build',
    right,
}: {
    left?: ReactNode;
    middle?: ReactNode;
    right?: ReactNode;
}) {
    return (
        <div className="pm-band">
            <div className="pm-band__left">
                {left ?? (
                    <>
                        <MirdyneMark title="" style={{ width: 14, height: 14 }} />
                        <span>Mirdyne</span>
                    </>
                )}
            </div>
            <div className="pm-band__middle">{middle}</div>
            <div className="pm-band__right">{right}</div>
        </div>
    );
}
