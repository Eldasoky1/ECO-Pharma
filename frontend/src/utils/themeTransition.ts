import { flushSync } from "react-dom";

type ViewTransitionDoc = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

/**
 * Toggles the theme with an expanding circular reveal originating from the
 * click point (View Transitions API). Falls back to an instant swap when
 * unsupported or when the user prefers reduced motion.
 */
export function circularThemeToggle(
  mutate: () => void,
  x: number = window.innerWidth / 2,
  y: number = 40
): void {
  const doc = document as ViewTransitionDoc;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!doc.startViewTransition || reducedMotion) {
    mutate();
    return;
  }

  const maxRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = doc.startViewTransition(() => {
    flushSync(mutate);
  });

  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius + 24}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    })
    .catch(() => {});
}
