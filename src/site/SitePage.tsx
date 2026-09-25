import { useEffect, type ReactNode } from 'react';
import { SiteFooter, SiteNav, type PageId } from './Chrome';

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

/** The page is drawn by script, so the browser's jump to a #fragment on load finds nothing; jump once it exists. */
function useFragmentOnLoad() {
    useEffect(() => {
        const id = decodeURIComponent(window.location.hash.slice(1));
        if (!id) return;
        let raf = 0;
        let live = true;
        // After the fonts, so the text above has its final height.
        document.fonts.ready.then(() => {
            if (live) raf = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
        });
        return () => {
            live = false;
            cancelAnimationFrame(raf);
        };
    }, []);
}

/** One page of the site: navigation, the page's sections, footer. */
export default function SitePage({ page, children }: { page: PageId; children: ReactNode }) {
    useReveal();
    useFragmentOnLoad();
    return (
        <>
            <a className="skip-link" href="#main">
                Skip to content
            </a>
            <SiteNav page={page} />
            <main id="main" className={`page page--${page}`}>
                {children}
            </main>
            <SiteFooter page={page} />
        </>
    );
}
