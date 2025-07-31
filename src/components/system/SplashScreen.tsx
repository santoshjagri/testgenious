
"use client";

import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1000); // Start fading out 500ms before it's removed

    return () => clearTimeout(fadeOutTimer);
  }, []);
  
  return (
    <div className={cn(
        "splash-screen fixed inset-0 z-[101] flex flex-col items-center justify-center bg-background",
        isFadingOut && "fade-out"
    )}>
      <div className="flex flex-col items-center justify-center">
        <div className="splash-logo p-4 bg-primary/10 rounded-full mb-4 ring-8 ring-primary/5">
           <Image src="/logo.png" alt="EduGenius AI Logo" width={80} height={80} className="object-contain" />
        </div>
        <h1 className="splash-text text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          EduGenius AI
        </h1>
      </div>
    </div>
  );
}
