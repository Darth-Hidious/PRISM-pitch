import { mount } from '../boot';
import { Contact, News } from '../Company';
import SitePage from '../SitePage';

/** The page, for the browser (below) and for the build, which renders it to HTML (scripts/prerender.mjs). */
export const page = (
    <SitePage page="news">
        <News n="01" h1 />
        <Contact />
    </SitePage>
);

mount(page);
