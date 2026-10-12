import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-[calc(100vh-160px)] flex flex-col justify-center items-center bg-slate-50/70 py-6 px-4 pb-20 sm:pb-10">
      <div className="w-full flex justify-center my-auto">{children}</div>
    </div>
  );
}
