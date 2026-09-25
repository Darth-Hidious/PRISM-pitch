import { mount } from '../boot';
import Business from '../Business';
import { Company, Contact } from '../Company';
import SitePage from '../SitePage';

mount(
    <SitePage page="company">
        <Company n="01" h1 />
        <Business n="02" />
        <Contact />
    </SitePage>,
);
