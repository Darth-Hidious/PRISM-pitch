import { useEffect } from 'react';
import { SiteFooter, SiteNav } from './Chrome';
import { Business, Company, Contact, Evidence, Hero, Loop, Modules, Programmes, Roadmap, Why } from './Sections';
import Stacks from './Stacks';

/** Adds `reveal--in` to `.reveal` elements as they scroll into view. */
function useReveal() {
    useEffect(() => {
        const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
        if (!('IntersectionObserver' in window)) {
            els.forEach((el) => el.classList.add('reveal--in'));
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        e.target.classList.add('reveal--in');
                        io.unobserve(e.target);
                    }
                }
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
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
                <Why />
                <Stacks />
                <Loop />
                <Modules />
                <Evidence />
                <Programmes />
                <Business />
                <Roadmap />
                <Company />
                <Contact />
            </main>
            <SiteFooter />
        </>
    );
}
