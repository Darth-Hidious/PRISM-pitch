import { mount } from '../boot';
import ContactDetails from '../ContactDetails';
import SitePage from '../SitePage';

/** The page, for the browser (below) and for the build, which renders it to HTML (scripts/prerender.mjs). */
export const page = (
    <SitePage page="contact">
        <ContactDetails />
    </SitePage>
);

mount(page);
