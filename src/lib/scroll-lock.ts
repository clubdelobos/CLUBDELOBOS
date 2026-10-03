let locks = 0;
let saved = "";

/** Freezes page scroll behind a dialog. Reference-counted, so overlapping dialogs
 * (a modal and its confirm dialog closing together) can release in any order
 * without leaving the page stuck at `overflow: hidden`. Returns the release fn. */
export function lockBodyScroll(): () => void {
  if (locks++ === 0) {
    saved = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--locks === 0) document.body.style.overflow = saved;
  };
}
