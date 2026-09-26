import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { LINKS } from './links';

/** The two ways in: our form, and the deck for investors. */
export const WAYS_IN = [
    { href: LINKS.interest, title: 'Register interest', text: 'Tell us what you need.', icon: 'form' },
    { href: LINKS.deck, title: 'Investor room', text: 'Our deck, for investors.', icon: 'deck' },
] as const;

function Icon({ name }: { name: 'form' | 'deck' }) {
    return name === 'form' ? (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 5.5h16v13H4z" stroke="currentColor" strokeWidth="1.5" />
            <path d="m4.5 6.5 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ) : (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3.5 4.5h17v11h-17zM12 15.5v4M8 19.5h8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 12.5v-2M10.5 12.5V9M14 12.5V7.5M17.5 12.5v-3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

/**
 * The bar's call to action. Pointing at it opens the two ways in; a tap, a click or the keyboard opens
 * them too and keeps them open until you choose, click elsewhere or press Escape.
 */
export default function InterestMenu() {
    const [open, setOpen] = useState(false);
    const pinned = useRef(false);
    const timer = useRef(0);
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const id = useId();

    const close = useCallback(() => {
        pinned.current = false;
        window.clearTimeout(timer.current);
        setOpen(false);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: globalThis.PointerEvent) => {
            if (!root.current?.contains(e.target as Node)) close();
        };
        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            close();
            trigger.current?.focus();
        };
        document.addEventListener('pointerdown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open, close]);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    // A mouse opens it on the way in and closes it a moment after leaving, so the gap is easy to cross.
    const enter = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        window.clearTimeout(timer.current);
        setOpen(true);
    };
    const leave = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || pinned.current) return;
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setOpen(false), 240);
    };
    const toggle = () => {
        if (open && pinned.current) close();
        else {
            pinned.current = true;
            setOpen(true);
        }
    };
    const items = () => Array.from(root.current?.querySelectorAll<HTMLAnchorElement>('.imenu__item') ?? []);
    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        pinned.current = true;
        setOpen(true);
        const list = items();
        const at = list.indexOf(document.activeElement as HTMLAnchorElement);
        const next = at < 0 ? (e.key === 'ArrowDown' ? 0 : list.length - 1) : (at + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length;
        // The panel becomes visible on the next frame; focus it then.
        requestAnimationFrame(() => items()[next]?.focus());
    };

    return (
        <div
            ref={root}
            className={`imenu${open ? ' is-open' : ''}`}
            onPointerEnter={enter}
            onPointerLeave={leave}
            onKeyDown={onKeyDown}
            onBlur={(e) => {
                if (!root.current?.contains(e.relatedTarget as Node)) close();
            }}
        >
            <button
                ref={trigger}
                type="button"
                className="pm-btn pm-btn--primary imenu__trigger"
                aria-expanded={open}
                aria-controls={id}
                onClick={toggle}
            >
                <span>Register interest</span>
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                </svg>
            </button>
            <div id={id} className="imenu__panel">
                <ul>
                    {WAYS_IN.map((w, i) => (
                        <li key={w.href}>
                            <a className={`imenu__item${i === 0 ? ' imenu__item--main' : ''}`} href={w.href} onClick={close}>
                                <span className="imenu__icon">
                                    <Icon name={w.icon} />
                                </span>
                                <span className="imenu__words">
                                    <b>{w.title}</b>
                                    <span>{w.text}</span>
                                </span>
                                <svg className="imenu__go" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                                </svg>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
