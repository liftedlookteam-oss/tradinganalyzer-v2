import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <SignUp
        routing="path"
        path="/sign-up"
        fallbackRedirectUrl="/"
        appearance={{
          variables: {
            colorPrimary: "#ffffff",
            colorBackground: "#09090b",
            colorText: "#ffffff",
            colorInputBackground: "#000000",
            colorInputText: "#ffffff",
          },
        }}
      />
    </main>
  );
}