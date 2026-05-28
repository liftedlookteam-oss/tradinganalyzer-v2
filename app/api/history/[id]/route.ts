import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const params = await context.params;

    const analysisId = params.id;

    if (!analysisId) {
      return Response.json(
        { error: "Missing analysis ID." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return Response.json(
        { error: "Analysis not found." },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      analysis: data,
    });
  } catch (error) {
    console.error(
      "GET_ANALYSIS_ERROR:",
      error
    );

    return Response.json(
      {
        error:
          "Failed to fetch analysis.",
      },
      { status: 500 }
    );
  }
}