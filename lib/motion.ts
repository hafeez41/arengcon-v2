/**
 * Site-wide motion language. One duration, one symmetric ease.
 * Matches BIG.dk's `transition: ... 0.78s cubic-bezier(0.45, 0, 0.55, 1)`.
 *
 * Use SIZE for any layout / size / position transition (framer-motion).
 * For CSS classes, use:  duration-[780ms] ease-[cubic-bezier(0.45,0,0.55,1)]
 */
export const SIZE = { duration: 0.78, ease: [0.45, 0, 0.55, 1] as const };
