import { mount } from '../boot';
import { Contact } from '../Company';
import Method from '../Method';
import OpenResearch from '../OpenResearch';
import SitePage from '../SitePage';

mount(
    <SitePage page="method">
        <Method n="01" h1 />
        <OpenResearch n="02" />
        <Contact />
    </SitePage>,
);
