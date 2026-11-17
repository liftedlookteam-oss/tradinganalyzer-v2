import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("user_id", userId)
    .order("trade_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ trades: data ?? [] });
}

export async function POST(request: Request) {
  return saveTrade(request, false);
}

export async function PATCH(request: Request) {
  return saveTrade(request, true);
}

async function saveTrade(request: Request, editing: boolean) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const asset = typeof body?.asset === "string" ? body.asset.trim().toUpperCase() : "";
  const { id, result, amount, notes, trade_date } = body ?? {};
  const validDate = typeof trade_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(trade_date) &&
    !Number.isNaN(Date.parse(trade_date)) &&
    new Date(trade_date).toISOString().slice(0, 10) === trade_date;

  if (!asset || !validDate || !["win", "loss", "breakeven"].includes(result) ||
      typeof amount !== "number" || !Number.isFinite(amount) ||
      (result !== "breakeven" && amount === 0) ||
      (editing && (typeof id !== "string" || !id))) {
    return Response.json({ error: "Enter a valid asset, date, result and amount." }, { status: 400 });
  }

  const trade = {
    asset,
    result,
    amount: result === "loss" ? -Math.abs(amount) : result === "breakeven" ? 0 : Math.abs(amount),
    notes: typeof notes === "string" ? notes.trim() || null : null,
    trade_date,
  };

  // The dashboard derives the balance from starting_balance and the trade ledger.
  const query = editing
    ? supabase.from("trades").update(trade).eq("user_id", userId).eq("id", id)
    : supabase.from("trades").insert({ ...trade, user_id: userId });
  const { data, error } = await query.select("*").maybeSingle();

  if (error) return Response.json({ error: "Could not save the trade." }, { status: 500 });
  if (!data) return Response.json({ error: "Trade not found." }, { status: 404 });
  return Response.json({ trade: data });
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Trade ID is required." }, { status: 400 });

  const { error } = await supabase.from("trades").delete().eq("user_id", userId).eq("id", id);
  if (error) return Response.json({ error: "Could not delete the trade." }, { status: 500 });
  return Response.json({ success: true });
}
