'use client';

import { useEffect } from 'react';

export default function ScrollObserver() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      reveals.forEach((el) => io.observe(el));
      return () => io.disconnect();
    } else {
      reveals.forEach((el) => el.classList.add('visible'));
    }
  }, []);

  return null;
}
