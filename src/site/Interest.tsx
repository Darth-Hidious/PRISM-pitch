import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '../ds';
import { useMediaQuery } from './hooks';
import { LINKS } from './links';
import { CONSORTIUM, PartnerLogo } from './partners';

/** What people can register interest in. The ids must match api/interest.ts. */
const AREAS = [
    { id: 'material', label: 'A new material for a part' },
    { id: 'deployment', label: 'PRISM on our programme' },
    { id: 'supply', label: 'Supply of a qualified material' },
    { id: 'research', label: 'Research collaboration' },
    { id: 'partnership', label: 'Partnership' },
    { id: 'investment', label: 'Investment' },
    { id: 'other', label: 'Something else' },
] as const;

type AreaId = (typeof AREAS)[number]['id'];
type Field = 'name' | 'email' | 'organisation' | 'role' | 'areas' | 'message' | 'consent';
type Errors = Partial<Record<Field, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MESSAGE_MAX = 3000;
const ORDER: Field[] = ['name', 'email', 'organisation', 'role', 'areas', 'message', 'consent'];

interface Values {
    name: string;
    email: string;
    organisation: string;
    role: string;
    areas: AreaId[];
    message: string;
    consent: boolean;
}

function check(v: Values): Errors {
    const e: Errors = {};
    if (v.name.trim().length < 2) e.name = 'Please enter your name.';
    if (!v.email.trim()) e.email = 'Please enter your email address.';
    else if (!EMAIL.test(v.email.trim())) e.email = 'Please enter a valid email address, like name@company.com.';
    if (!v.organisation.trim()) e.organisation = 'Please enter your organisation.';
    if (v.areas.length === 0) e.areas = 'Please choose at least one.';
    if (v.message.length > MESSAGE_MAX) e.message = `Please keep your message under ${MESSAGE_MAX} characters.`;
    if (!v.consent) e.consent = 'Please agree, so that we can keep your details and reply.';
    return e;
}

/** A topic named in the link (`/interest/?topic=investment`) starts chosen. */
function topicFromUrl(): AreaId[] {
    const t = new URLSearchParams(window.location.search).get('topic');
    return AREAS.some((a) => a.id === t) ? [t as AreaId] : [];
}

/** The page on our site the visitor came from, if any: it tells us which button brought them. */
function cameFrom() {
    try {
        const r = new URL(document.referrer);
        return r.origin === window.location.origin ? r.pathname : '';
    } catch {
        return '';
    }
}

function Tick() {
    return (
        <svg className="tick" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect className="tick__box" x="1.5" y="1.5" width="13" height="13" rx="2" />
            <path className="tick__mark" d="m4.5 8.2 2.3 2.3 4.7-5" />
        </svg>
    );
}

function Text({
    id,
    label,
    optional,
    error,
    children,
}: {
    id: Field;
    label: string;
    optional?: boolean;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className={`field${error ? ' field--bad' : ''}`}>
            <label className="field__label" htmlFor={`f-${id}`}>
                {label}
                {optional && <small>Optional</small>}
            </label>
            {children}
            {error && (
                <p className="field__error" id={`f-${id}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
}

function InterestForm() {
    const [v, setV] = useState<Values>(() => ({
        name: '',
        email: '',
        organisation: '',
        role: '',
        areas: topicFromUrl(),
        message: '',
        consent: false,
    }));
    const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
    const [server, setServer] = useState<Errors>({});
    const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
    const [failure, setFailure] = useState('');
    const [trap, setTrap] = useState('');
    const opened = useRef(0);
    const form = useRef<HTMLFormElement>(null);
    const thanks = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        opened.current = Date.now();
    }, []);

    useEffect(() => {
        if (state === 'sent') thanks.current?.focus();
    }, [state]);

    const local = check(v);
    const shown = (f: Field) => server[f] ?? (touched[f] ? local[f] : undefined);
    const set = <K extends keyof Values>(k: K, value: Values[K]) => {
        setV((s) => ({ ...s, [k]: value }));
        if (server[k as Field]) setServer((s) => ({ ...s, [k]: undefined }));
    };
    const blur = (f: Field) => () => setTouched((t) => (t[f] ? t : { ...t, [f]: true }));
    const aria = (f: Field) => ({
        'aria-invalid': shown(f) ? true : undefined,
        'aria-describedby': shown(f) ? `f-${f}-error` : undefined,
    });

    // Focus the field, and bring it with its label and message to the middle of the screen, clear of the bar.
    const focusField = (f: Field) => {
        const el = form.current?.querySelector<HTMLElement>(`[data-field="${f}"]`);
        if (!el) return;
        el.focus({ preventScroll: true });
        el.closest('.field')?.scrollIntoView({ block: 'center' });
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (state === 'sending') return;
        const errs = check(v);
        setTouched(Object.fromEntries(ORDER.map((f) => [f, true])));
        const first = ORDER.find((f) => errs[f]);
        if (first) {
            focusField(first);
            return;
        }
        setState('sending');
        setFailure('');
        try {
            const res = await fetch('/api/interest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...v,
                    name: v.name.trim(),
                    email: v.email.trim(),
                    website: trap,
                    elapsed: Date.now() - opened.current,
                    from: cameFrom(),
                }),
            });
            const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; field?: Field } | null;
            if (res.ok && data?.ok) {
                setState('sent');
                return;
            }
            if (data?.field && data.error) {
                setServer({ [data.field]: data.error });
                focusField(data.field);
            }
            setFailure(data?.error ?? 'Something went wrong on our side. Please try again in a moment.');
            setState('failed');
        } catch {
            setFailure('We could not reach our server. Please check your connection and try again.');
            setState('failed');
        }
    };

    if (state === 'sent') {
        const first = v.name.trim().split(/\s+/)[0];
        return (
            <div className="ask__done" role="status">
                <span className="ask__done-mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </span>
                <h2 ref={thanks} tabIndex={-1}>
                    Thank you, {first}.
                </h2>
                <p>
                    We have your message and will reply to <b>{v.email.trim()}</b>.
                </p>
                <div className="ask__done-actions">
                    <Button href={LINKS.deck}>Investor room</Button>
                    <Button variant="secondary" href="/">
                        Back to the site
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form ref={form} className="ask__form" noValidate onSubmit={submit} aria-labelledby="ask-form-title">
            <h2 id="ask-form-title" className="pm-visually-hidden">
                Your details
            </h2>
            <div className="ask__row">
                <Text id="name" label="Full name" error={shown('name')}>
                    <input
                        id="f-name"
                        data-field="name"
                        className="field__input"
                        type="text"
                        name="name"
                        autoComplete="name"
                        maxLength={120}
                        required
                        value={v.name}
                        onChange={(e) => set('name', e.target.value)}
                        onBlur={blur('name')}
                        {...aria('name')}
                    />
                </Text>
                <Text id="email" label="Work email" error={shown('email')}>
                    <input
                        id="f-email"
                        data-field="email"
                        className="field__input"
                        type="email"
                        name="email"
                        autoComplete="email"
                        inputMode="email"
                        spellCheck={false}
                        maxLength={254}
                        required
                        value={v.email}
                        onChange={(e) => set('email', e.target.value)}
                        onBlur={blur('email')}
                        {...aria('email')}
                    />
                </Text>
            </div>
            <div className="ask__row">
                <Text id="organisation" label="Organisation" error={shown('organisation')}>
                    <input
                        id="f-organisation"
                        data-field="organisation"
                        className="field__input"
                        type="text"
                        name="organisation"
                        autoComplete="organization"
                        maxLength={160}
                        required
                        value={v.organisation}
                        onChange={(e) => set('organisation', e.target.value)}
                        onBlur={blur('organisation')}
                        {...aria('organisation')}
                    />
                </Text>
                <Text id="role" label="Role" optional error={shown('role')}>
                    <input
                        id="f-role"
                        data-field="role"
                        className="field__input"
                        type="text"
                        name="role"
                        autoComplete="organization-title"
                        maxLength={120}
                        value={v.role}
                        onChange={(e) => set('role', e.target.value)}
                        {...aria('role')}
                    />
                </Text>
            </div>

            <fieldset className={`field chips${shown('areas') ? ' field--bad' : ''}`} aria-describedby={shown('areas') ? 'f-areas-error' : undefined}>
                <legend className="field__label">
                    What are you interested in? <small>Choose any</small>
                </legend>
                <div className="chips__list">
                    {AREAS.map((a, i) => {
                        const on = v.areas.includes(a.id);
                        return (
                            <label key={a.id} className="chip">
                                <input
                                    type="checkbox"
                                    name="areas"
                                    value={a.id}
                                    checked={on}
                                    data-field={i === 0 ? 'areas' : undefined}
                                    onChange={() => {
                                        set('areas', on ? v.areas.filter((x) => x !== a.id) : [...v.areas, a.id]);
                                        setTouched((t) => ({ ...t, areas: true }));
                                    }}
                                />
                                <span>
                                    <Tick />
                                    {a.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
                {shown('areas') && (
                    <p className="field__error" id="f-areas-error">
                        {shown('areas')}
                    </p>
                )}
            </fieldset>

            <Text id="message" label="Message" optional error={shown('message')}>
                <textarea
                    id="f-message"
                    data-field="message"
                    className="field__input"
                    name="message"
                    rows={5}
                    maxLength={MESSAGE_MAX}
                    placeholder="What must the part survive? Timeline, quantities, anything that helps."
                    value={v.message}
                    onChange={(e) => set('message', e.target.value)}
                    onBlur={blur('message')}
                    {...aria('message')}
                />
                <span className="field__count" aria-hidden="true">
                    {v.message.length} / {MESSAGE_MAX}
                </span>
            </Text>

            {/* People never see this field. Bots fill it in. */}
            <div className="ask__trap" aria-hidden="true">
                <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                </label>
            </div>

            <div className={`field consent${shown('consent') ? ' field--bad' : ''}`}>
                <label className="consent__box">
                    <input
                        type="checkbox"
                        name="consent"
                        data-field="consent"
                        checked={v.consent}
                        onChange={(e) => {
                            set('consent', e.target.checked);
                            setTouched((t) => ({ ...t, consent: true }));
                        }}
                        {...aria('consent')}
                    />
                    <Tick />
                    <span>Mirdyne may keep these details to reply to me.</span>
                </label>
                <p className="consent__note">
                    We use them only to reply. They are stored in Frankfurt with our hosting provider and deleted after
                    twelve months, or sooner if you ask.
                </p>
                {shown('consent') && (
                    <p className="field__error" id="f-consent-error">
                        {shown('consent')}
                    </p>
                )}
            </div>

            {state === 'failed' && failure && (
                <p className="ask__failure" role="alert">
                    {failure}
                </p>
            )}

            <div className="ask__send">
                <button type="submit" className="pm-btn pm-btn--primary" disabled={state === 'sending'} aria-busy={state === 'sending'}>
                    <span>{state === 'sending' ? 'Sending…' : 'Send'}</span>
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                    </svg>
                </button>
            </div>
        </form>
    );
}

const NEXT = ['You tell us what you need.', 'We reply by email.', 'If PRISM fits, we set up a call.'];

/**
 * /interest/: our own form. On wide screens a furnace photograph fills the left, with the heading, what
 * happens next and the people we work with; the form sits on the right. On phones they stack: heading,
 * form, the rest.
 */
export default function Interest() {
    // On wide screens the bar spans both columns: it follows the dark one, so the form column does not claim it.
    const wide = useMediaQuery('(min-width: 961px)');
    return (
        <section className="ask" aria-labelledby="ask-title">
            <div className="ask__photo" aria-hidden="true">
                <img src="/img/spark-furnace.webp" alt="" width={989} height={1144} fetchPriority="high" />
            </div>
            <div className="ask__side" data-theme="navy" data-nav="navy">
                <div className="ask__head">
                    <p className="w-label rise">Register interest</p>
                    <h1 id="ask-title" className="w-h2 rise" style={{ animationDelay: '80ms' }}>
                        Tell us what you need.
                    </h1>
                    <p className="w-lead rise" style={{ animationDelay: '160ms' }}>
                        A new material, a research project or an investment.
                    </p>
                </div>
            </div>
            <div className="ask__main" data-theme="paper" data-nav={wide ? undefined : 'paper'}>
                <InterestForm />
            </div>
            <div className="ask__more" data-theme="navy" data-nav="navy">
                <ol className="ask__next" aria-label="What happens next">
                    {NEXT.map((t, i) => (
                        <li key={t}>
                            <span>{String(i + 1).padStart(2, '0')}</span>
                            {t}
                        </li>
                    ))}
                </ol>
                <p className="ask__investors">
                    Investor? <a href={LINKS.deck}>Visit the investor room</a>
                </p>
                <div className="ask__partners">
                    <p className="w-label">PRISM Alpha, with</p>
                    <ul aria-label="PRISM Alpha consortium">
                        {CONSORTIUM.map((p) => (
                            <li key={p.id}>
                                <PartnerLogo p={p} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
