import { mount } from '../boot';
import Interest from '../Interest';
import SitePage from '../SitePage';

/** The page, for the browser (below) and for the build, which renders it to HTML (scripts/prerender.mjs). */
export const page = (
    <SitePage page="interest">
        <Interest />
    </SitePage>
);

mount(page);
