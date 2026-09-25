import { mount } from '../boot';
import { Contact } from '../Company';
import Europe from '../Europe';
import Explore from '../Explore';
import { Gap } from '../Gap';
import Hero from '../Hero';
import Loop from '../Loop';
import SitePage from '../SitePage';

mount(
    <SitePage page="home">
        <Hero />
        <Gap />
        <Europe />
        <Loop />
        <Explore />
        <Contact />
    </SitePage>,
);
