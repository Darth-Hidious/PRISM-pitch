/**
 * The pieces of scripts/prerender.mjs that work on text alone, kept apart so tests can run them
 * (tests/prerender-lib.test.mjs).
 *
 * The site is drawn by React in the browser. For readers without JavaScript, crawlers and AI agents, the
 * build also writes each page's content into its HTML, and a Markdown copy beside it:
 *
 *   cleanMarkup   the rendered page, minus what only works with JavaScript or only decorates;
 *   toMarkdown    the page's <main> as Markdown;
 *   injectPage    the built HTML file with that markup, a link to the Markdown and the page's JSON-LD.
 */
import { parseHTML } from 'linkedom';
import TurndownService from 'turndown';

export const SITE = 'https://www.mirdyne.com';

/** Hides the plain copy from the first paint wherever the page's script will run and draw the page itself. */
export const HEAD_SNIPPET =
    `<script>if('noModule' in HTMLScriptElement.prototype)document.documentElement.classList.add('js')</script>` +
    `<style>.js [data-prerender]{display:none}</style>`;

/** A document with `markup` inside <div id="x">, and that div. */
function fragment(markup) {
    const { document } = parseHTML(`<!doctype html><html><body><div id="x">${markup}</div></body></html>`);
    return { document, root: document.getElementById('x') };
}

/** The few words the plain copy adds itself, in each language. */
const WORDS = {
    en: {
        diagram: 'Diagram',
        form: ['This form needs JavaScript. Without it, write to ', ' with your name, your organisation and what you need.'],
    },
    de: {
        diagram: 'Diagramm',
        form: ['Dieses Formular funktioniert nur mit JavaScript. Schreiben Sie uns sonst an ', ', mit Ihrem Namen, Ihrer Organisation und Ihrem Anliegen.'],
    },
};

/** The drawing's own description: aria-label, or the text of its <title>. */
function svgLabel(svg) {
    const label = svg.getAttribute('aria-label') || svg.querySelector('title')?.textContent || '';
    return label.replace(/\s+/g, ' ').trim();
}

/**
 * The rendered page without what needs JavaScript or only decorates:
 * - anything aria-hidden, canvases and scripts;
 * - buttons (menus, tabs and toggles do nothing without the script);
 * - drawings (SVG): one that describes itself (role="img" or "group" with a label) becomes that
 *   description as text, the rest go;
 * - forms: sending one needs the script, and a plain browser would put the answers into the address, so
 *   each form becomes a line that names the other way to reach us;
 * - React's preload hints, and every picture loads lazily: where the script runs, this copy is hidden
 *   (display: none), and a browser never fetches lazy images there, so the page loads what it loaded
 *   before. Without the script, the pictures load as they scroll into view.
 */
export function cleanMarkup(markup, { email, lang = 'en' }) {
    const words = WORDS[lang];
    const { document, root } = fragment(markup);
    for (const el of root.querySelectorAll('[aria-hidden="true"], canvas, script, noscript, template, button, [role="tablist"], link')) {
        el.remove();
    }
    for (const img of root.querySelectorAll('img')) {
        img.setAttribute('loading', 'lazy');
        // React writes it as fetchPriority; HTML attribute names ignore case.
        for (const { name } of [...img.attributes]) if (name.toLowerCase() === 'fetchpriority') img.removeAttribute(name);
    }
    for (const svg of root.querySelectorAll('svg')) {
        const label = svgLabel(svg);
        const role = svg.getAttribute('role');
        if (label && (role === 'img' || role === 'group')) {
            const p = document.createElement('p');
            p.setAttribute('class', 'prerender-figure');
            p.textContent = `${words.diagram}: ${label}`;
            svg.replaceWith(p);
        } else {
            svg.remove();
        }
    }
    for (const form of root.querySelectorAll('form')) {
        const p = document.createElement('p');
        p.setAttribute('class', 'prerender-form');
        p.append(words.form[0], Object.assign(document.createElement('a'), { href: `mailto:${email}`, textContent: email }), words.form[1]);
        form.replaceWith(p);
    }
    return root.innerHTML;
}

/** The page's <main> as Markdown, links made absolute, with a short footer that points to the rest of the site. */
export function toMarkdown(markup, { path, footer }) {
    const { document, root } = fragment(markup);
    const main = root.querySelector('main');
    if (!main) throw new Error(`toMarkdown: no <main> on ${path}`);
    const base = `${SITE}${path}`;

    // Navigation inside the page (the legal pages' language switch) is not content.
    for (const el of main.querySelectorAll('nav')) el.remove();
    // Section numbers ("01") are layout, and so is a legend for a drawing that is not in the text. The
    // label after the number stays, as does any small label, except the ones right above the page title.
    for (const el of main.querySelectorAll('.idx > b, .idx__tail')) el.remove();
    const h1 = main.querySelector('h1');
    for (const label of main.querySelectorAll('.idx, .w-label')) {
        if (h1 && label.parentElement === h1.parentElement) label.remove();
        else if (label.matches('.idx')) label.replaceWith(Object.assign(document.createElement('p'), { textContent: label.textContent.trim() }));
    }
    // The document opens with its title, even where the page shows a picture first.
    if (h1) main.prepend(h1);
    // Pictures drawn with CSS (the partners' logos) are named by their label.
    for (const el of main.querySelectorAll('[role="img"][aria-label]')) {
        if (el.tagName !== 'IMG' && !el.textContent.trim()) el.replaceWith(el.getAttribute('aria-label'));
    }
    // Elements the page sets apart with layout alone ("Funded by" above "The European Space Agency")
    // would run together as text: put a space between neighbours with nothing between them.
    // The same for a number set apart from the words after it ("01" then "You tell us").
    const alnumEnd = /[\p{L}\p{N}]$/u;
    const alnumStart = /^[\p{L}\p{N}]/u;
    for (const el of main.querySelectorAll('*')) {
        const next = el.nextSibling;
        if (!next) continue;
        if (next.nodeType === 1) el.after(' ');
        else if (next.nodeType === 3 && !el.matches('sup, sub') && alnumEnd.test(el.textContent) && alnumStart.test(next.textContent))
            el.after(' ');
    }
    // Lists whose items carry headings are sections laid out as a list: keep them as sections.
    for (const list of [...main.querySelectorAll('ul, ol')].reverse()) {
        if (![...list.children].some((li) => li.querySelector('h1, h2, h3, h4, h5, h6'))) continue;
        const box = document.createElement('div');
        for (const li of [...list.children]) {
            const div = document.createElement('div');
            div.append(...li.childNodes);
            box.append(div);
        }
        list.replaceWith(box);
    }
    // A definition list reads best as a list of "**term** definition".
    for (const dl of main.querySelectorAll('dl')) {
        const ul = document.createElement('ul');
        for (const dt of dl.querySelectorAll('dt')) {
            const li = document.createElement('li');
            const strong = document.createElement('strong');
            strong.textContent = dt.textContent.trim();
            li.append(strong, ' ', dt.nextElementSibling?.textContent.trim() ?? '');
            ul.append(li);
        }
        dl.replaceWith(ul);
    }
    // Folded notes ("Sources") become one line: "Sources: …".
    for (const details of main.querySelectorAll('details')) {
        const summary = details.querySelector('summary');
        const label = summary?.textContent.trim() ?? '';
        summary?.remove();
        const p = document.createElement('p');
        const em = document.createElement('em');
        em.textContent = `${label}:`;
        p.append(em, ' ', details.textContent.replace(/\s+/g, ' ').trim());
        details.replaceWith(p);
    }
    for (const a of main.querySelectorAll('a[href]')) a.setAttribute('href', new URL(a.getAttribute('href'), base).href);
    for (const img of main.querySelectorAll('img')) {
        if (!img.getAttribute('alt')) img.remove();
        else img.setAttribute('src', new URL(img.getAttribute('src'), base).href);
    }

    const turndown = new TurndownService({
        headingStyle: 'atx',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        emDelimiter: '*',
        strongDelimiter: '**',
        // A backslash line break (CommonMark), which survives the trimming of trailing spaces below.
        br: '\\',
    });
    const body = turndown
        .turndown(main.innerHTML)
        .replace(/[ \t]+$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    return `${body}\n\n---\n\n${footer.trim()}\n`;
}

/**
 * Every piece of text a reader meets on a page: text, and the alt, aria-label, title and placeholder
 * attributes. Parts marked with a language of their own (lang="…": the legal pages' English and German
 * articles, the language switch) are left out; they are meant to be in that language.
 */
export function visibleTexts(markup) {
    const { root } = fragment(markup);
    for (const el of root.querySelectorAll('[lang]')) el.remove();
    const out = new Set();
    const walk = (node) => {
        for (const child of node.childNodes) {
            if (child.nodeType === 3) {
                const text = child.textContent.replace(/\s+/g, ' ').trim();
                if (text) out.add(text);
            } else if (child.nodeType === 1) {
                for (const a of ['alt', 'aria-label', 'title', 'placeholder']) {
                    const v = child.getAttribute(a)?.replace(/\s+/g, ' ').trim();
                    if (v) out.add(v);
                }
                walk(child);
            }
        }
    };
    walk(root);
    return out;
}

/**
 * Text a German page shows exactly as its English twin does, with words in it, that is not German from
 * the dictionary (names and symbols count as German when the dictionary maps them to themselves).
 */
export function untranslated(englishMarkup, germanMarkup, keptTheSame) {
    const english = visibleTexts(englishMarkup);
    return [...visibleTexts(germanMarkup)].filter((t) => english.has(t) && /\p{L}{3}/u.test(t) && !keptTheSame.has(t));
}

/** JSON for inside <script>: nothing in it can close the element early. */
export const scriptJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

/**
 * The built page with the plain copy in #root, and in <head> the hiding rule, plus the link to the
 * page's Markdown and its JSON-LD where it has them.
 */
export function injectPage(template, { markup, markdownHref, jsonLd }) {
    const root = '<div id="root"></div>';
    if (template.split(root).length !== 2) throw new Error('injectPage: the page must have exactly one empty #root');
    if (template.split('</head>').length !== 2) throw new Error('injectPage: the page must have exactly one </head>');
    const head = [
        markdownHref ? `<link rel="alternate" type="text/markdown" href="${markdownHref}" />` : '',
        HEAD_SNIPPET,
        jsonLd ? `<script type="application/ld+json">${scriptJson(jsonLd)}</script>` : '',
    ]
        .filter(Boolean)
        .join('\n    ');
    // Replacer functions, so a "$" in the page's text is taken literally.
    return template
        .replace('</head>', () => `  ${head}\n  </head>`)
        .replace(root, () => `<div id="root"><div data-prerender>${markup}</div></div>`);
}
