"use client";

type FeatureCardProps = {
  title: string;
  text: string;
};

export default function FeatureCard({
  title,
  text,
}: FeatureCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-5 sm:rounded-3xl sm:p-6">
      <h2 className="text-xl font-bold sm:text-2xl">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">
        {text}
      </p>
    </div>
  );
}