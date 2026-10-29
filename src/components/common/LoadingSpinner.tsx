"use client";

import React from "react";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingSpinner({
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3.5">
      <div className="relative flex items-center justify-center w-12 h-12">
        <svg
          className="w-full h-full animate-spin"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="spinner-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#0d5c3a" stopOpacity="1" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="url(#spinner-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {message && (
        <p className="text-xs font-semibold text-slate-600 tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-999 flex items-center justify-center bg-white/80 backdrop-blur-xs transition-all duration-300">
        {spinnerContent}
      </div>
    );
  }

  return <div className="py-8 flex justify-center">{spinnerContent}</div>;
}
