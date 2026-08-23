import { useMotionValue, useSpring } from 'framer-motion';
import { useEffect } from 'react';

export function useParallax(multiplier = 15) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs coordinates interpolation
  const springX = useSpring(x, { stiffness: 120, damping: 25 });
  const springY = useSpring(y, { stiffness: 120, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const pctX = (e.clientX - innerWidth / 2) / (innerWidth / 2); // -1 to 1 range
      const pctY = (e.clientY - innerHeight / 2) / (innerHeight / 2); // -1 to 1 range
      x.set(pctX * multiplier);
      y.set(pctY * multiplier);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y, multiplier]);

  return { x: springX, y: springY };
}
