import { useEffect } from 'react';
import Business from './Business';
import { SiteFooter, SiteNav } from './Chrome';
import { Company, Contact, News } from './Company';
import Evidence from './Evidence';
import { Gap, Precedent } from './Gap';
import Hero from './Hero';
import Loop from './Loop';
import Method from './Method';
import Roadmap from './Roadmap';
import Stacks from './Stacks';

/** Adds `in` to `.rv` elements as they scroll into view, once. */
function useReveal() {
    useEffect(() => {
        const els = Array.from(document.querySelectorAll<HTMLElement>('.rv'));
        if (!('IntersectionObserver' in window)) {
            els.forEach((el) => el.classList.add('in'));
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        e.target.classList.add('in');
                        io.unobserve(e.target);
                    }
                }
            },
            { rootMargin: '0px 0px -6% 0px', threshold: 0.04 },
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);
}

export default function SiteApp() {
    useReveal();
    return (
        <>
            <a className="skip-link" href="#main">
                Skip to content
            </a>
            <SiteNav />
            <main id="main">
                <Hero />
                <Gap />
                <Precedent />
                <Loop />
                <Stacks />
                <Method />
                <Evidence />
                <Business />
                <Roadmap />
                <Company />
                <News />
                <Contact />
            </main>
            <SiteFooter />
        </>
    );
}
