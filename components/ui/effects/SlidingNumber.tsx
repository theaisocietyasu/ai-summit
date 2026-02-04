'use client';

import { useEffect, useRef, useState } from 'react';
import './SlidingNumber.css';

interface SlidingNumberProps {
  value: number;
  padStart?: boolean;
}

export function SlidingNumber({ value, padStart = false }: SlidingNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 150);
      prevValue.current = value;
      return () => clearTimeout(timeout);
    }
  }, [value]);

  const formattedValue = padStart
    ? displayValue.toString().padStart(2, '0')
    : displayValue.toString();

  const formattedNewValue = padStart
    ? value.toString().padStart(2, '0')
    : value.toString();

  return (
    <span className="sliding-number">
      <span className={`sliding-number__current ${isAnimating ? 'sliding-out' : ''}`}>
        {formattedValue}
      </span>
      {isAnimating && (
        <span className="sliding-number__next sliding-in">
          {formattedNewValue}
        </span>
      )}
    </span>
  );
}

export default SlidingNumber;
