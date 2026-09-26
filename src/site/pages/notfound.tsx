import { mount } from '../boot';
import NotFound from '../NotFound';
import SitePage from '../SitePage';

/** The page, for the browser (below) and for the build, which renders it to HTML (scripts/prerender.mjs). */
export const page = (
    <SitePage page="notfound">
        <NotFound />
    </SitePage>
);

mount(page);
