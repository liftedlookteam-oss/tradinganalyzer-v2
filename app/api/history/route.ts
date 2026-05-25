import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("analyses")
      .select("id, created_at, market, trade_duration, analysis")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      analyses: data,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to load history." },
      { status: 500 }
    );
  }
}