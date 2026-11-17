import { supabase } from "@/lib/supabase";

export const FREE_ANALYSIS_INTERVAL_MS = 24 * 60 * 60 * 1000;

export async function reserveFreeAnalysis(userId: string) {
  const now = Date.now();
  const reservedAt = new Date(now).toISOString();
  const cutoff = new Date(now - FREE_ANALYSIS_INTERVAL_MS).toISOString();

  const { data: updated, error: updateError } = await supabase
    .from("user_usage")
    .update({ last_free_analysis_at: reservedAt })
    .eq("user_id", userId)
    .or(`last_free_analysis_at.is.null,last_free_analysis_at.lte.${cutoff}`)
    .select("user_id")
    .maybeSingle();
  if (updateError) throw updateError;
  if (updated) return reservedAt;

  const { data: inserted, error: insertError } = await supabase
    .from("user_usage")
    .upsert({ user_id: userId, last_free_analysis_at: reservedAt }, {
      onConflict: "user_id",
      ignoreDuplicates: true,
    })
    .select("user_id")
    .maybeSingle();
  if (insertError) throw insertError;
  return inserted ? reservedAt : null;
}

export async function freeAnalysisAvailableAt(userId: string) {
  const { data, error } = await supabase.from("user_usage")
    .select("last_free_analysis_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.last_free_analysis_at
    ? Date.parse(data.last_free_analysis_at) + FREE_ANALYSIS_INTERVAL_MS
    : 0;
}

export async function releaseFreeAnalysis(userId: string, reservedAt: string) {
  const { error } = await supabase.from("user_usage")
    .delete()
    .eq("user_id", userId)
    .eq("last_free_analysis_at", reservedAt);
  if (error) console.error("Could not release free analysis reservation", error);
}
