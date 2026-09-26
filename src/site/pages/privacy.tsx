import { mount } from '../boot';
import { Privacy } from '../Legal';
import SitePage from '../SitePage';

/** The page, for the browser (below) and for the build, which renders it to HTML (scripts/prerender.mjs). */
export const page = (
    <SitePage page="privacy">
        <Privacy />
    </SitePage>
);

mount(page);
