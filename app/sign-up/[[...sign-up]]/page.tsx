import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <SignUp
        routing="path"
        path="/sign-up"
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            card: "bg-zinc-950 border border-zinc-800 shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-zinc-400",
            formFieldLabel: "text-zinc-300",
            formFieldInput:
              "bg-black text-white border border-zinc-700 placeholder:text-zinc-500",
            footerActionText: "text-zinc-400",
            footerActionLink: "text-white font-bold",
            socialButtonsBlockButton:
              "bg-black border border-zinc-700 text-white hover:bg-zinc-900",
          },
        }}
      />
    </main>
  );
}