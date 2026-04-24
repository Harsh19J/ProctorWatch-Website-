import { useRef, useState, useEffect } from 'react';

/**
 * useScrollReveal
 * Returns [ref, isVisible] — attach ref to any element to trigger
 * a visibility flag when it enters the viewport.
 *
 * @param {Object} options
 * @param {number}  options.threshold  – 0-1, how much of the element must be visible (default 0.12)
 * @param {boolean} options.once       – if true, stays visible after first trigger (default true)
 * @param {string}  options.rootMargin – IntersectionObserver rootMargin (default '0px')
 */
export function useScrollReveal({ threshold = 0.12, once = true, rootMargin = '0px' } = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.disconnect();
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold, once, rootMargin]);

    return [ref, isVisible];
}

export default useScrollReveal;
