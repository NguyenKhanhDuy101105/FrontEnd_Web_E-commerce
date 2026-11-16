"use client";

import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface LazyLoadSectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  height?: string;
}

export default function LazyLoadSection({
  children,
  fallback,
  height = "350px",
}: LazyLoadSectionProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px",
  });

  useEffect(() => {
    if (inView && !shouldRender) {
      setShouldRender(true);
    }
  }, [inView, shouldRender]);

  return (
    <div ref={ref} style={{ minHeight: !shouldRender ? height : undefined }}>
      {shouldRender ? children : fallback || null}
    </div>
  );
}
