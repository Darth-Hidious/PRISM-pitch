import { mount } from '../boot';
import { Contact } from '../Company';
import Europe from '../Europe';
import Explore from '../Explore';
import { Gap } from '../Gap';
import Hero from '../Hero';
import Loop from '../Loop';
import Made from '../Made';
import SitePage from '../SitePage';

mount(
    <SitePage page="home">
        <Hero />
        <Gap />
        <Made n="02" />
        <Europe />
        <Loop n="03" />
        <Explore n="04" />
        <Contact />
    </SitePage>,
);
