import { currentUser } from "@clerk/nextjs/server";

export async function hasUnlimitedAnalysis() {
  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress;

    return (
      email?.verification?.status === "verified" &&
      email.emailAddress.toLowerCase() === "hiiesalusten@gmail.com"
    );
  } catch (error) {
    console.error("Could not verify unlimited analysis access.", error);
    return false;
  }
}
