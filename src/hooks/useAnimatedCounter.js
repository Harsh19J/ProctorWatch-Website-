import { useRef, useState, useEffect } from 'react';

/**
 * useAnimatedCounter
 * Counts from 0 to `target` when the returned `ref` enters the viewport.
 *
 * @param {number|string} target   – Final value (number or string like "99.8")
 * @param {number}        duration – Animation duration in ms (default 1600)
 * @returns {{ ref, display }} – attach ref to the wrapper element
 */
export function useAnimatedCounter(target, duration = 1600) {
    const ref = useRef(null);
    const started = useRef(false);
    const [count, setCount] = useState(0);

    const numericTarget = parseFloat(String(target).replace(/[^0-9.]/g, ''));
    const isDecimal = String(target).includes('.');

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const steps = 60;
                    let step = 0;
                    const interval = setInterval(() => {
                        step++;
                        const progress = step / steps;
                        // ease-out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.min(numericTarget * eased, numericTarget));
                        if (step >= steps) {
                            setCount(numericTarget);
                            clearInterval(interval);
                        }
                    }, duration / steps);
                }
            },
            { threshold: 0.4 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [numericTarget, duration]);

    const display = isDecimal ? count.toFixed(1) : Math.round(count);
    return { ref, display };
}

export default useAnimatedCounter;
