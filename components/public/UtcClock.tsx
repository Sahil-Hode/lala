'use client';

import { useState, useEffect } from 'react';

export default function UtcClock() {
  const [timeStr, setTimeStr] = useState<string>('—');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTimeStr(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return <div className="status-chip" id="utc-clock">{timeStr}</div>;
}
