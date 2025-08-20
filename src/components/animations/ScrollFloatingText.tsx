// app/components/ScrollFloatingText.tsx

"use client";

import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";

interface ScrollFloatingTextProps {
  children: ReactNode;
}

export default function ScrollFloatingText({ children }: ScrollFloatingTextProps) {
  const textRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    el.style.transformStyle = "preserve-3d";
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    el.style.textShadow = "0px 0px 0px rgba(0,0,0,0)";

    const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

    const getEffectStrength = () => {
      const width = window.innerWidth;
      if (width > 1280) return { rotate: 25, shadow: 15 };
      if (width > 768) return { rotate: 18, shadow: 10 };
      return { rotate: 0, shadow: 0 }; // mobile fallback (no effect)
    };

    const resetTransform = () => {
      gsap.to(el, {
        duration: 0.4,
        ease: "power3.out",
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        textShadow: "0px 0px 0px rgba(0,0,0,0)",
        clearProps: "transform",
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile()) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const { rotate, shadow } = getEffectStrength();

      const rotateX = ((y - centerY) / centerY) * -rotate;
      const rotateY = ((x - centerX) / centerX) * rotate;
      const scale = 1.1;
      const shadowX = ((x - centerX) / centerX) * -shadow;
      const shadowY = ((y - centerY) / centerY) * -shadow;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
      el.style.textShadow = `${shadowX}px ${shadowY}px 18px rgba(0,0,0,0.3)`;
    };

    const handleMouseLeave = () => resetTransform();
    const handleVisibilityChange = () => {
      if (document.hidden) resetTransform();
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <span
      ref={textRef}
      className="inline-block text-display-xl bg-gradient-shimmer bg-clip-text text-transparent"
      aria-hidden="true"
      role="presentation"
    >
      {children}
    </span>
  );
}
