import { useEffect } from 'react';
import { useT } from './i18n';
import { LINKS } from './links';

const PLACES = [
    { href: '/', label: 'Home' },
    { href: '/platform/', label: 'Platform' },
    { href: '/method/', label: 'Method' },
    { href: '/company/', label: 'Company' },
    { href: '/news/', label: 'News' },
    { href: '/contact/', label: 'Contact' },
    { href: LINKS.interest, label: 'Register interest' },
];

/**
 * The page for addresses that do not exist (404.html; the server keeps the 404 status). One file serves
 * both languages: under /de/ the browser draws it in German (see mount() in boot.ts). Agents that ask
 * for Markdown get the same in Markdown from api/not-found.ts.
 */
export default function NotFound() {
    const t = useT();
    useEffect(() => {
        if (t.lang === 'de') document.title = t('Page not found | PRISM by Mirdyne');
    }, [t]);
    return (
        <section className="sec legal" data-theme="paper" data-nav="paper" aria-labelledby="notfound-title">
            <div className="wrap legal__wrap">
                <header className="legal__head">
                    <p className="w-label">{t('Error 404')}</p>
                    <h1 id="notfound-title" className="w-h2">
                        {t('Page not found.')}
                    </h1>
                    <p className="w-lead">{t('There is no page at this address. The link may be wrong, or the page may have moved.')}</p>
                </header>
                <div className="legal__body">
                    <h2>{t('Pages on this site')}</h2>
                    <ul className="legal__list">
                        {PLACES.map((p) => (
                            <li key={p.href}>
                                <a href={t.link(p.href)}>{t(p.label)}</a>
                            </li>
                        ))}
                    </ul>
                    <h2>{t('Indexes')}</h2>
                    <p>
                        {t.rich(
                            'The <0>site map</0> lists every page. For language models and other software, <1>llms.txt</1> describes the site and links a Markdown version of each page.',
                            (s) => <a href="/sitemap.xml">{s}</a>,
                            (s) => <a href="/llms.txt">{s}</a>,
                        )}
                    </p>
                </div>
            </div>
        </section>
    );
}
