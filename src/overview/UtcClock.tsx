import { useEffect, useState } from 'react';

const timeOf = (date: Date) => date.toISOString().slice(11, 19);

/** Live HH:MM:SS UTC readout for the top strip. Decorative, so hidden from screen readers. */
export default function UtcClock({ className = '' }: { className?: string }) {
    const [time, setTime] = useState(() => timeOf(new Date()));

    useEffect(() => {
        const id = window.setInterval(() => setTime(timeOf(new Date())), 1000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <span className={className} aria-hidden="true">
            {time} UTC
        </span>
    );
}
