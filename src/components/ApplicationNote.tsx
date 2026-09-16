import { useRef } from 'react';

const BLOG_URL = import.meta.env.DEV
    ? 'http://127.0.0.1:3100/blog/four-euros-a-minute'
    : 'https://siddharthayashkovid.com/blog/four-euros-a-minute';

export default function ApplicationNote() {
    const dialogRef = useRef<HTMLDialogElement>(null);

    return (
        <>
            <button
                type="button"
                className="application-note-trigger"
                aria-haspopup="dialog"
                onClick={() => dialogRef.current?.showModal()}
            >
                Latest update · ESA BIC Hessen application rejected ↗
            </button>
            <dialog ref={dialogRef} className="application-note-dialog" aria-labelledby="application-note-title">
                <div className="application-note-toolbar">
                    <span>A personal note</span>
                    <button type="button" autoFocus onClick={() => dialogRef.current?.close()}>Close ×</button>
                </div>
                <article>
                    <h1 id="application-note-title">ESA BIC Hessen: application update</h1>
                    <p>On 15 September 2026, ESA BIC Hessen rejected our application for incubation. Its feedback called for further development of the market, business model and intellectual-property arrangements, and encouraged us to reapply.</p>
                    <p>I disagree with the assessment. We have customers, and I believe we presented those customers and their needs clearly in the application.</p>
                    <p>My underlying disagreement concerns how a venture building a new capability is evaluated. I do not believe that capability can be fully defined in advance as a fixed offering with a standard price list. Its scope develops through the work and the requirements of the customers using it.</p>
                    <p>I will continue the technical work on PRISM. I will not personally lead another application to this programme. The company remains free to pursue it with someone else leading that work.</p>
                    <footer>
                        <p>By Siddhartha Yash Kovid</p>
                        <a href={BLOG_URL} target="_blank" rel="noopener noreferrer">More on my blog ↗</a>
                    </footer>
                </article>
            </dialog>
        </>
    );
}
