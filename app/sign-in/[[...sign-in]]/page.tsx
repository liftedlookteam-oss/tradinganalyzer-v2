import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <SignIn routing="path" path="/sign-in" />
    </main>
  );
}