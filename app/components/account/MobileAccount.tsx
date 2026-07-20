"use client";

import type { ReactNode } from "react";

type MobileAccountProps = {
  children: ReactNode;
};

export default function MobileAccount({
  children,
}: MobileAccountProps) {
  return (
    <main className="min-h-screen bg-[#050505] px-5 py-6 text-white">
      {children}
    </main>
  );
}