import { mount } from '../boot';
import Chooses from '../Chooses';
import { Contact } from '../Company';
import Method from '../Method';
import OpenResearch from '../OpenResearch';
import Proof from '../Proof';
import SitePage from '../SitePage';

/** The page, for the browser (below) and for the build, which renders it to HTML (scripts/prerender.mjs). */
export const page = (
    <SitePage page="method">
        <Method n="01" h1 />
        <Chooses n="02" />
        <OpenResearch n="03" />
        <Proof n="04" />
        <Contact />
    </SitePage>
);

mount(page);
