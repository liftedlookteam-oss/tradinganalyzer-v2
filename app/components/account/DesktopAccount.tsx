"use client";

import type { ReactNode } from "react";

type DesktopAccountProps = {
  children: ReactNode;
};

export default function DesktopAccount({
  children,
}: DesktopAccountProps) {
  return (
    <main className="min-h-screen bg-[#050505] px-4 py-5 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </main>
  );
}