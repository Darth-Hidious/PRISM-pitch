import { mount } from '../boot';
import { Impressum } from '../Legal';
import SitePage from '../SitePage';

mount(
    <SitePage page="impressum">
        <Impressum />
    </SitePage>,
);
