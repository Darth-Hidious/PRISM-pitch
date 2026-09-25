import { mount } from '../boot';
import { Contact } from '../Company';
import Evidence from '../Evidence';
import SitePage from '../SitePage';

mount(
    <SitePage page="evidence">
        <Evidence n="01" h1 />
        <Contact />
    </SitePage>,
);
