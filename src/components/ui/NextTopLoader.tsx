'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type NextTopLoaderProps = {
  color?: string;
  height?: number;
  shadow?: string;
  showSpinner?: boolean;
  initialPosition?: number;
  crawlSpeed?: number;
  crawl?: boolean;
  easing?: string;
  speed?: number;
};

export default function NextTopLoader({
  color = '#2563eb',
  height = 3,
  shadow = '0 0 10px #2563eb,0 0 5px #2563eb',
  initialPosition = 0.08,
  crawlSpeed = 200,
  crawl = true,
  easing = 'ease',
  speed = 200,
}: NextTopLoaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(initialPosition);
  const timersRef = useRef<number[]>([]);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];

    setVisible(true);
    setProgress(initialPosition);

    if (crawl) {
      timersRef.current.push(
        window.setTimeout(() => {
          setProgress(0.72);
        }, Math.max(crawlSpeed, 120))
      );
    }

    timersRef.current.push(
      window.setTimeout(() => {
        setProgress(1);
      }, Math.max(speed * 2, 360))
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setVisible(false);
      }, Math.max(speed * 3, 640))
    );

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, [
    pathname,
    searchParams,
    crawl,
    crawlSpeed,
    initialPosition,
    speed,
  ]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
      style={{ height }}
    >
      <div
        className="h-full origin-left"
        style={{
          width: `${Math.max(0, Math.min(progress, 1)) * 100}%`,
          backgroundColor: color,
          boxShadow: shadow,
          transition: `width ${Math.max(speed, 120)}ms ${easing}, opacity 180ms ease`,
        }}
      />
    </div>
  );
}
