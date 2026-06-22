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

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { asset, result, amount, notes, trade_date } = body;

  if (!asset || !result || amount === undefined || !trade_date) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const numericAmount = Number(amount);

  const { error: tradeError } = await supabase.from("trades").insert({
    user_id: userId,
    asset,
    result,
    amount: numericAmount,
    notes: notes || null,
    trade_date,
  });

  if (tradeError) {
    return Response.json({ error: tradeError.message }, { status: 500 });
  }

  const { data: account, error: accountFetchError } = await supabase
    .from("trading_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (accountFetchError) {
    return Response.json({ error: accountFetchError.message }, { status: 500 });
  }

  if (account) {
    const nextBalance = Number(account.current_balance || 0) + numericAmount;

    const { error: updateError } = await supabase
      .from("trading_accounts")
      .update({
        current_balance: nextBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }
  }

  return Response.json({ success: true });
}