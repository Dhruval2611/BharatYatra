import React, { useEffect, useRef } from 'react';
import { useInView, animate } from 'framer-motion';

interface CountUpProps {
    end: number;
    duration?: number;
    suffix?: string;
    className?: string;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 2, suffix = '', className = '' }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView && ref.current) {
            const controls = animate(0, end, {
                duration: duration,
                ease: [0.25, 0.46, 0.45, 0.94],
                onUpdate: (value) => {
                    if (ref.current) {
                        ref.current.textContent = `${Math.floor(value)}${suffix}`;
                    }
                },
            });

            return () => controls.stop();
        }
    }, [isInView, end, duration, suffix]);

    return <span ref={ref} className={className}>0{suffix}</span>;
};

export default CountUp;
