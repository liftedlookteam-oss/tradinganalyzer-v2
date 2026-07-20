"use client";

type PlanItemProps = {
  text: string;
};

export default function PlanItem({
  text,
}: PlanItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
        ✓
      </div>

      <p className="font-semibold text-black">
        {text}
      </p>
    </div>
  );
}