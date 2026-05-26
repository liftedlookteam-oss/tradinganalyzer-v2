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
      .select("id, created_at, user_id, market, instrument, trade_duration, analysis")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      items: data || [],
      analyses: data || [],
    });
  } catch (error) {
    console.error("HISTORY_GET_ERROR:", error);

    return Response.json(
      { error: "Failed to load history." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    let id: string | null = null;

    try {
      const body = await request.json();
      id = body?.id || null;
    } catch {
      const { searchParams } = new URL(request.url);
      id = searchParams.get("id");
    }

    if (!id) {
      return Response.json(
        { error: "Missing analysis id." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("HISTORY_DELETE_ERROR:", error);

    return Response.json(
      { error: "Failed to delete analysis." },
      { status: 500 }
    );
  }
}