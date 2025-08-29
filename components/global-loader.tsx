'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Fallback client transition loader (used in layout if desired)
export function GlobalLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loader on path change
    setLoading(true);
    setProgress(10);
    const inc = setInterval(() => {
      setProgress((p) => Math.min(90, p + Math.random() * 15));
    }, 150);
    // Simulate finish on next tick frame
    const finalize = () => {
      setProgress(100);
      const hide = () => setLoading(false);
      setTimeout(hide, 220);
    };
    const scheduleFinalize = () => setTimeout(finalize, 250);
    const done = requestAnimationFrame(scheduleFinalize);
    return () => {
      clearInterval(inc);
      cancelAnimationFrame(done);
    };
  }, [pathname]);

  if (!loading) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
      <div
        className={cn(
          'h-full bg-primary transition-all duration-200 ease-out',
          progress === 100 && 'opacity-0',
        )}
        style={{ width: progress + '%' }}
      />
    </div>
  );
}
