import { useState, useEffect, useRef } from 'react';

export function useCountUp(target, duration = 1300) {
  const [value, setValue] = useState(0);
  const raf = useRef();
  const from = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    const start_val = from.current;
    from.current = target;
    let startTs = null;
    const step = (ts) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setValue(Math.round(start_val + (target - start_val) * eased));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}
