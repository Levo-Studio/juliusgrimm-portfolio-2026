/**
 * Runs before first paint: applies the stored theme so the page never flashes
 * the wrong ground, and marks the document as reveal-capable. The reveal class
 * is set here rather than in CSS so that with JS disabled nothing is ever
 * hidden — sections just render visible.
 */
const script = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}document.documentElement.classList.add("reveal-ready")})()`;

export const ThemeScript = (): React.JSX.Element => (
  <script dangerouslySetInnerHTML={{ __html: script }} />
);
