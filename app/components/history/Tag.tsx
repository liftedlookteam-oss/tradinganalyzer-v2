"use client";

import { ReactNode } from "react";

type TagProps = {
  children: ReactNode;
  highlight?: boolean;
  muted?: boolean;
};

export default function Tag({
  children,
  highlight = false,
  muted = false,
}: TagProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        highlight
          ? "bg-white text-black"
          : muted
          ? "bg-zinc-900 text-zinc-500"
          : "bg-black text-zinc-300"
      }`}
    >
      {children}
    </span>
  );
}