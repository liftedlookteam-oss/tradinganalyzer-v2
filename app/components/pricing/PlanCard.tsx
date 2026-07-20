"use client";

import PlanItem from "./PlanItem";

type PlanCardProps = {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  onClick?: () => void;
  href?: string;
  loading?: boolean;
  disabled?: boolean;
  featured?: boolean;
  badge?: string;
};

export default function PlanCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  onClick,
  href,
  loading,
  disabled,
  featured,
  badge,
}: PlanCardProps) {
const Button = (
  <div className="mt-6 rounded-2xl bg-black px-5 py-3.5 text-center text-sm font-bold text-white sm:mt-8 sm:py-4 sm:text-base">
      {loading ? "Redirecting..." : buttonText}
    </div>
  );

  return (
    <div
     className={`relative rounded-[1.5rem] bg-white p-5 text-black sm:rounded-[2rem] md:p-7 ${
        featured
          ? "border-2 border-white"
          : "border border-white"
      }`}
    >
      {badge && (
        <div className="absolute right-4 top-4 rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white sm:right-6 sm:top-6 sm:text-xs sm:tracking-[0.2em]">
          {badge}
        </div>
      )}

      <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-600">
        {title}
      </p>

      <div className="mt-5 flex items-end gap-2">
       <p className="text-4xl font-bold sm:text-5xl">{price}</p>
        <p className="mb-1 text-sm text-zinc-600 sm:mb-2 sm:text-base">
          / {period}
        </p>
      </div>

      <p className="mt-4 text-sm leading-7 text-zinc-700 sm:mt-5 sm:text-base sm:leading-8">
        {description}
      </p>

      <div className="mt-6 space-y-3 sm:mt-7">
        {features.map((feature) => (
          <PlanItem
            key={feature}
            text={feature}
          />
        ))}
      </div>

      {href ? (
        <a
          href={href}
          className="block"
        >
          {Button}
        </a>
      ) : (
        <button
          onClick={onClick}
          disabled={disabled}
          className="block w-full text-left"
        >
          {Button}
        </button>
      )}
    </div>
  );
}