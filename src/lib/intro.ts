/**
 * Whether the intro curtain is covering the page. The hero waits for it so the
 * polaroids drop where people can see them, not behind the curtain.
 */
let playing = false;
const EVENT = "ms:intro-done";

export function setIntroPlaying(on: boolean) {
  playing = on;
  if (!on && typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

/** Resolves once the intro is out of the way (immediately if there isn't one). */
export function introDone(): Promise<void> {
  if (!playing) return Promise.resolve();
  return new Promise((resolve) => {
    // never hold the hero hostage if the intro fails to report back
    const t = setTimeout(resolve, 6000);
    window.addEventListener(
      EVENT,
      () => {
        clearTimeout(t);
        resolve();
      },
      { once: true },
    );
  });
}
