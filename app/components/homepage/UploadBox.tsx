"use client";

import { useEffect, useRef, useState } from "react";

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

  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

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
    <div
      className={`flex cursor-pointer flex-col justify-between border-2 border-dashed border-zinc-700 bg-zinc-950 transition hover:border-white hover:bg-zinc-900 ${
        compact
          ? "min-h-[190px] min-w-0 rounded-2xl p-3 [overflow-wrap:anywhere]"
          : "min-h-[260px] rounded-3xl p-5"
      }`}
    >
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          event.target.value = "";
          if (!selected) return;
          if (!["image/png", "image/jpeg", "image/webp"].includes(selected.type) || selected.size > 2_000_000) {
            setError("Choose a PNG, JPEG or WebP image up to 2 MB.");
            return;
          }
          setError("");
          onChange(selected);
        }}
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

      <button type="button" aria-label={`Choose ${title} image`} onClick={() => input.current?.click()}
        className={
          compact
            ? "mt-3 min-h-11 rounded-xl bg-black px-2 py-2 text-center text-xs text-zinc-500"
            : "mt-6 rounded-2xl bg-black px-4 py-3 text-sm text-zinc-500"
        }
      >
        {file ? "Replace image" : "Click to upload"}
      </button>
      {file && <button type="button" onClick={() => { setError(""); onChange(null); }} className={compact ? "mt-2 min-h-11 text-sm underline" : "mt-2 text-sm underline"}>Remove image</button>}
      <p className="mt-2 text-xs text-zinc-400">PNG, JPEG or WebP · 2 MB max</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}