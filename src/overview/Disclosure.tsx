import { useId, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * A button that shows and hides a panel with a smooth height transition.
 * Used by the story cards and the FAQ. The panel stays in the DOM (so the
 * height can animate) but is hidden from assistive tech while closed.
 */
export default function Disclosure({
    summary,
    children,
    heading,
    defaultOpen = false,
    buttonClassName = '',
    panelClassName = '',
}: {
    summary: ReactNode;
    children: ReactNode;
    /** Wrap the button (not the panel) in a heading, as the accordion pattern requires. */
    heading?: 'h3' | 'h4';
    defaultOpen?: boolean;
    buttonClassName?: string;
    panelClassName?: string;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const panelId = useId();
    const Heading = heading;

    const button = (
        <button
            type="button"
            className={`disclosure-button ${buttonClassName}`}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
        >
            <span>{summary}</span>
            <span className="plus-icon" aria-hidden="true" />
        </button>
    );

    return (
        <>
            {Heading ? <Heading>{button}</Heading> : button}
            <div id={panelId} className={`collapsible ${panelClassName}`} data-open={open} aria-hidden={!open}>
                <div>{children}</div>
            </div>
        </>
    );
}
