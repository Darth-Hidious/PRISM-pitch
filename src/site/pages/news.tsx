import { mount } from '../boot';
import { Contact, News } from '../Company';
import SitePage from '../SitePage';

mount(
    <SitePage page="news">
        <News n="01" h1 />
        <Contact />
    </SitePage>,
);
