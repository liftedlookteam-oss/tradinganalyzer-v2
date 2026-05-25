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

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing analysis id." }, { status: 400 });
    }

    const { error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to delete analysis." },
      { status: 500 }
    );
  }
}