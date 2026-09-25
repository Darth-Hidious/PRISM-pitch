import { mount } from '../boot';
import { Contact } from '../Company';
import Roadmap from '../Roadmap';
import Stacks from '../Stacks';
import SitePage from '../SitePage';

mount(
    <SitePage page="platform">
        <Stacks n="01" h1 />
        <Roadmap n="02" />
        <Contact />
    </SitePage>,
);
