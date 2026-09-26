import { createContext, useContext } from 'react';

/** Whether a slide is the one on screen, and whether the deck is in its phone reader. */
export const SlideContext = createContext({ active: false, reader: false });

export const useSlide = () => useContext(SlideContext);
