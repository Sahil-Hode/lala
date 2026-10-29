'use client';

import { useState, useEffect } from 'react';

interface TerminalLine {
  text: string;
  isPrompt?: boolean;
  command?: string;
  hasCursor?: boolean;
}

export default function TerminalAnimation() {
  const [visibleCount, setVisibleCount] = useState<number>(0);

  const lines: TerminalLine[] = [
    { text: 'handshake --secure', isPrompt: true, command: 'root@nexus:~#' },
    { text: 'channel: AES-256 / clearance verified' },
    { text: 'await_signal', isPrompt: true, command: 'root@nexus:~#' },
    { text: 'listening on encrypted intake…', hasCursor: true },
  ];

  useEffect(() => {
    const delays = [600, 1500, 2200, 2800];
    const timers = delays.map((delay, index) =>
      setTimeout(() => {
        setVisibleCount(index + 1);
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="terminal-box" id="terminal-output" aria-hidden="true">
      {lines.slice(0, visibleCount).map((l, i) => (
        <div key={i}>
          {l.isPrompt && <span className="prompt">{l.command} </span>}
          {l.text}
          {l.hasCursor && <span className="cursor-blink" />}
        </div>
      ))}
    </div>
  );
}
