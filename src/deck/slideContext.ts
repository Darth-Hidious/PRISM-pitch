import { createContext, useContext } from 'react';
import { useReducedMotion } from '../site/hooks';

/** Whether a slide is the one on screen, and whether the deck is in its phone reader. */
export const SlideContext = createContext({ active: false, reader: false });

export const useSlide = () => useContext(SlideContext);

/** Motion only on the slide on screen (or in the reader), and never when the viewer asks for less. */
export function useLive() {
    const { active, reader } = useSlide();
    const reduced = useReducedMotion();
    return { live: (active || reader) && !reduced, active, reader, reduced };
}
