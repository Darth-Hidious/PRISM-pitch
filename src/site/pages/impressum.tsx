import { mount } from '../boot';
import { Impressum } from '../Legal';
import SitePage from '../SitePage';

/** The page, for the browser (below) and for the build, which renders it to HTML (scripts/prerender.mjs). */
export const page = (
    <SitePage page="impressum">
        <Impressum />
    </SitePage>
);

mount(page);
