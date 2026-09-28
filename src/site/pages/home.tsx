import { mount } from '../boot';
import { Contact } from '../Company';
import Europe from '../Europe';
import Explore from '../Explore';
import { Gap } from '../Gap';
import Hero from '../Hero';
import Loop from '../Loop';
import Made from '../Made';
import Markets from '../Markets';
import SitePage from '../SitePage';

/** The page, for the browser (below) and for the build, which renders it to HTML (scripts/prerender.mjs). */
export const page = (
    <SitePage page="home">
        <Hero />
        <Gap />
        <Made n="02" />
        <Europe />
        <Loop n="03" />
        <Markets n="04" />
        <Explore n="05" />
        <Contact />
    </SitePage>
);

mount(page);
