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
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />

        <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center text-white font-black text-sm shadow-xs">
          Loading
        </div>
      </div>

      {message && (
        <p className="text-xs font-bold text-slate-700 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-xs">
        {spinnerContent}
      </div>
    );
  }

  return <div className="py-8 flex justify-center">{spinnerContent}</div>;
}
