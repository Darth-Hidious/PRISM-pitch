import { mount } from '../boot';
import { Contact } from '../Company';
import Method from '../Method';
import OpenResearch from '../OpenResearch';
import Proof from '../Proof';
import SitePage from '../SitePage';

/** The page, for the browser (below) and for the build, which renders it to HTML (scripts/prerender.mjs). */
export const page = (
    <SitePage page="method">
        <Method n="01" h1 />
        <OpenResearch n="02" />
        <Proof n="03" />
        <Contact />
    </SitePage>
);

mount(page);
