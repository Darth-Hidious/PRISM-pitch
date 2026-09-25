import type { ReactNode } from 'react';
import type { PageId } from './Chrome';

const CC_BY = 'https://creativecommons.org/licenses/by/3.0/';
const CC_BY_4 = 'https://creativecommons.org/licenses/by/4.0/';
const CC_BY_SA_IGO = 'https://creativecommons.org/licenses/by-sa/3.0/igo/';

const VULCAIN = 'https://www.dlr.de/en/images/2011/3/vulcain-2-engine-on-test-facility-p5-at-dlr-lampoldshausen_3149';
const VINCI = 'https://www.dlr.de/de/bilder/2016/2/vinci-triebwerk-im-pruefstand-p4-1_23249';
const MERIS = 'https://www.esa.int/ESA_Multimedia/Images/2010/09/MERIS_mosaic_of_Europe';

/** A link to the photograph's own page. */
const source = (href: string, text: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
        {text}
    </a>
);

/** A link to the licence it is used under. */
const licence = (href: string, text: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer license">
        {text}
    </a>
);

const vinci = (
    <>
        {source(VINCI, 'Vinci engine in test stand P4.1')}: DLR, {licence(CC_BY, 'CC BY 3.0')}
    </>
);

/**
 * Photo credits for each page, shown once in the footer rather than under every picture. Pages with only
 * our own photographs need none.
 */
export const CREDITS: Partial<Record<PageId, ReactNode>> = {
    home: (
        <>
            {source(VULCAIN, 'Vulcain 2 on test stand P5')}: DLR, {licence(CC_BY, 'CC BY 3.0')}, cropped · {vinci}, cropped ·{' '}
            {source(MERIS, 'Europe from Envisat')}: ESA, {licence(CC_BY_SA_IGO, 'CC BY-SA 3.0 IGO')}, resized · Award:
            Hessen Ideen.
        </>
    ),
    method: (
        <>
            {vinci}, resized · Fruit-fly brain map: MaleCNS v1.0, FlyEM, HHMI Janelia, {licence(CC_BY_4, 'CC BY 4.0')}.
        </>
    ),
    news: <>Award photo: Hessen Ideen.</>,
};
