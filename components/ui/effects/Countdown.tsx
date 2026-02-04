'use client';

import { useEffect, useState } from 'react';
import { SlidingNumber } from './SlidingNumber';
import './Countdown.css';

interface CountdownProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return { days, hours, minutes, seconds };
}

export function Countdown({ targetDate }: CountdownProps) {
  // Initialize with null to avoid hydration mismatch - time is only calculated on client
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Calculate initial time on client only
    setTimeLeft(calculateTimeLeft(targetDate));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Show placeholder during SSR to avoid hydration mismatch
  if (!timeLeft) {
    return (
      <div className="countdown">
        <div className="countdown__item">
          <div className="countdown__value">--</div>
          <div className="countdown__label">Days</div>
        </div>
        <span className="countdown__separator">:</span>
        <div className="countdown__item">
          <div className="countdown__value">--</div>
          <div className="countdown__label">Hours</div>
        </div>
        <span className="countdown__separator">:</span>
        <div className="countdown__item">
          <div className="countdown__value">--</div>
          <div className="countdown__label">Minutes</div>
        </div>
        <span className="countdown__separator">:</span>
        <div className="countdown__item">
          <div className="countdown__value">--</div>
          <div className="countdown__label">Seconds</div>
        </div>
      </div>
    );
  }

  return (
    <div className="countdown">
      <div className="countdown__item">
        <div className="countdown__value">
          <SlidingNumber value={timeLeft.days} padStart={false} />
        </div>
        <div className="countdown__label">Days</div>
      </div>
      <span className="countdown__separator">:</span>
      <div className="countdown__item">
        <div className="countdown__value">
          <SlidingNumber value={timeLeft.hours} padStart={true} />
        </div>
        <div className="countdown__label">Hours</div>
      </div>
      <span className="countdown__separator">:</span>
      <div className="countdown__item">
        <div className="countdown__value">
          <SlidingNumber value={timeLeft.minutes} padStart={true} />
        </div>
        <div className="countdown__label">Minutes</div>
      </div>
      <span className="countdown__separator">:</span>
      <div className="countdown__item">
        <div className="countdown__value">
          <SlidingNumber value={timeLeft.seconds} padStart={true} />
        </div>
        <div className="countdown__label">Seconds</div>
      </div>
    </div>
  );
}

export default Countdown;
