"use client";

import { useEffect, useState } from "react";

type UploadBoxProps = {
  title: string;
  description: string;
  file: File | null;
  onChange: (file: File | null) => void;
  compact?: boolean;
};

export default function UploadBox({
  title,
  description,
  file,
  onChange,
  compact = false,
}: UploadBoxProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <label
      className={`flex cursor-pointer flex-col justify-between border-2 border-dashed border-zinc-700 bg-zinc-950 transition hover:border-white hover:bg-zinc-900 ${
        compact
          ? "min-h-[170px] rounded-2xl p-3"
          : "min-h-[260px] rounded-3xl p-5"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />

      <div>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={title}
            className={`w-full object-cover border border-zinc-800 ${
              compact
                ? "mb-3 h-20 rounded-xl"
                : "mb-5 h-28 rounded-2xl"
            }`}
          />
        ) : (
          <div
            className={`flex items-center justify-center bg-white text-black ${
              compact
                ? "mb-3 h-9 w-9 rounded-xl text-lg"
                : "mb-5 h-12 w-12 rounded-2xl text-2xl"
            }`}
          >
            ↑
          </div>
        )}

        <h3 className={compact ? "text-base font-bold" : "text-xl font-bold"}>
          {title}
        </h3>

        <p
          className={
            compact
              ? "mt-2 text-[11px] leading-4 text-zinc-500"
              : "mt-3 text-sm leading-6 text-zinc-500"
          }
        >
          {description}
        </p>
      </div>

      <div
        className={
          compact
            ? "mt-4 rounded-xl bg-black px-2 py-2 text-center text-[10px] text-zinc-500"
            : "mt-6 rounded-2xl bg-black px-4 py-3 text-sm text-zinc-500"
        }
      >
        {file ? "Replace image" : "Click to upload"}
      </div>
    </label>
  );
}