import { mount } from '../boot';
import { Contact } from '../Company';
import Roadmap from '../Roadmap';
import Stacks from '../Stacks';
import SitePage from '../SitePage';

/** The page, for the browser (below) and for the build, which renders it to HTML (scripts/prerender.mjs). */
export const page = (
    <SitePage page="platform">
        <Stacks n="01" h1 />
        <Roadmap n="02" />
        <Contact />
    </SitePage>
);

mount(page);
