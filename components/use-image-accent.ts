"use client";

import { useEffect, useState } from "react";
import { accentFromImage, type ImageAccent } from "@/lib/image-accent";

const FALLBACK: ImageAccent = { color: "#ffffff", contrast: 21 };

export function useImageAccent(src: string) {
  const [accent, setAccent] = useState<ImageAccent>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      setAccent(accentFromImage(image));
    };
    image.onerror = () => {
      if (!cancelled) setAccent(FALLBACK);
    };
    image.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return accent;
}
