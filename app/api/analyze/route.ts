import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const timeframeLabels: Record<string, string> = {
  daily: "Daily",
  h4: "4H",
  h2: "2H",
  h1: "1H",
  m15: "15M",
  m5: "5M",
};

function normalizeScore(value: unknown) {
  const score = Number(value);

  if (!Number.isFinite(score)) return 0;
  if (score > 0 && score <= 10) return Math.round(score * 10);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function cleanAnalysis(rawAnalysis: any) {
  return {
    overallBias: rawAnalysis?.overallBias || "Unclear",
    tradeQuality: rawAnalysis?.tradeQuality || "No Trade",
    marketState: rawAnalysis?.marketState || "Unclear",
    noTradeReason: rawAnalysis?.noTradeReason || "",

    htfBias: rawAnalysis?.htfBias || "Unclear",
    executionBias: rawAnalysis?.executionBias || "Wait",
    liquidityContext:
      rawAnalysis?.liquidityContext || "Liquidity context is unclear.",
    invalidation:
      rawAnalysis?.invalidation ||
      "No clear invalidation level or condition identified.",
    noTradeConditions:
      rawAnalysis?.noTradeConditions ||
      "No specific no-trade conditions identified.",
    patienceRating:
      rawAnalysis?.patienceRating || "Wait for confirmation",
    confidenceScore: normalizeScore(rawAnalysis?.confidenceScore),
    executionQuality:
      rawAnalysis?.executionQuality || "Not suitable for execution yet.",

    mostImportantThing:
      rawAnalysis?.mostImportantThing || "No clear priority identified.",
    keyLevels: rawAnalysis?.keyLevels || "No clear levels identified.",
    marketStructure:
      rawAnalysis?.marketStructure || "Market structure is unclear.",
    bullishScenario:
      rawAnalysis?.bullishScenario || "No clear bullish scenario.",
    bullishConditions:
      rawAnalysis?.bullishConditions ||
      "No clear bullish confirmation conditions.",
    bearishScenario:
      rawAnalysis?.bearishScenario || "No clear bearish scenario.",
    bearishConditions:
      rawAnalysis?.bearishConditions ||
      "No clear bearish confirmation conditions.",
    bullishScore: normalizeScore(rawAnalysis?.bullishScore),
    bearishScore: normalizeScore(rawAnalysis?.bearishScore),
    scoreReason: rawAnalysis?.scoreReason || "",
    finalDecision:
      rawAnalysis?.finalDecision ||
      "No trade until clearer confirmation appears.",
  };
}

function isWithinLast24Hours(dateValue: string | null) {
  if (!dateValue) return false;

  const lastUsed = new Date(dateValue).getTime();
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  return now - lastUsed < twentyFourHours;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle();

    const isPro = subscription?.status === "active";

    if (!isPro) {
      const { data: usage } = await supabase
        .from("user_usage")
        .select("last_free_analysis_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (usage && isWithinLast24Hours(usage.last_free_analysis_at)) {
        return Response.json(
          {
            error: "Free daily analysis already used.",
            code: "FREE_LIMIT_REACHED",
          },
          { status: 402 }
        );
      }
    }

    const formData = await request.formData();

    const market = formData.get("market") as string;
    const instrument = ((formData.get("instrument") as string) || "").trim();
    const tradeDuration = formData.get("tradeDuration") as string;

    const imageInputs = [];

    for (const key of Object.keys(timeframeLabels)) {
      const image = formData.get(key) as File | null;

      if (image && image.size > 0) {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString("base64");

        imageInputs.push({
          timeframe: timeframeLabels[key],
          imageUrl: `data:${image.type};base64,${base64Image}`,
        });
      }
    }

    if (imageInputs.length < 2) {
      return Response.json(
        { error: "At least 2 timeframe images are required." },
        { status: 400 }
      );
    }

    const content: any[] = [
      {
        type: "input_text",
        text: `
You are a professional trading decision-support assistant.

Market type: ${market}
Instrument / pair / ticker: ${instrument || "Not provided"}
Planned trade duration: ${tradeDuration}

The user uploaded multiple chart screenshots from different timeframes.

Use the instrument only as extra context. The screenshots are the primary source of truth.
If no instrument is provided, analyze normally without guessing the instrument.

Your role:
Give a strict, practical, disciplined market analysis. Your job is not to predict. Your job is to determine whether the setup has a clear edge.

Do NOT give blind trade signals.

Strict language rules:
- Never say "buy now", "sell now", "enter now", "go long now", or "go short now".
- Do not give financial advice.
- Do not pretend certainty.
- Prefer conditional language.
- If the setup is weak or unclear, say WAIT or NO TRADE clearly.

Decision discipline:
- Most chart situations should NOT be treated as immediate execution.
- "Wait" and "No Trade" are valid professional outcomes.
- Do not force a bullish or bearish trade idea if confirmation is missing.
- If the market is choppy, late in the move, mixed across timeframes, or trading directly into support/resistance, tradeQuality must be "No Trade" or "Bad".

Market state classification:
You must classify marketState as exactly one of:
- Trending
- Ranging
- Pullback
- Breakout
- Reversal attempt
- Choppy / No edge
- Unclear

Timeframe priority:
- Scalp: prioritize 5M, 15M, 1H. Higher timeframes only matter if they show immediate major support/resistance.
- Intraday: prioritize 15M, 1H, 4H.
- Session trade: prioritize 15M, 1H, 2H, 4H.
- Swing: prioritize 4H and Daily.
- Position: prioritize Daily and 4H.

Professional analysis requirements:
You must explicitly assess:
- Higher timeframe bias
- Execution timeframe bias
- Liquidity context
- Invalidation condition
- No-trade conditions
- Patience rating
- Confidence score
- Execution quality

Score rules:
- Scores are from 0 to 100.
- Never use 0–10 scale.
- Scores above 75 should be rare and require strong timeframe alignment.
- If setup is mixed, keep scores between 35 and 65.
- If both bullishScore and bearishScore are below 40, tradeQuality must be Bad or No Trade.
- confidenceScore should reflect total clarity, not just direction.
- Bullish and bearish scores do not need to add to 100.

Output style:
- Specific.
- Short.
- Practical.
- No generic textbook explanations.
- Prefer conditions over predictions.
- Speak like a strict trading mentor.

Return ONLY valid JSON in this exact structure:

{
  "overallBias": "Bullish | Bearish | Neutral | Unclear",
  "tradeQuality": "Bad | Moderate | Good | No Trade",
  "marketState": "Trending | Ranging | Pullback | Breakout | Reversal attempt | Choppy / No edge | Unclear",
  "noTradeReason": "",

  "htfBias": "",
  "executionBias": "Bullish | Bearish | Neutral | Wait | No Trade",
  "liquidityContext": "",
  "invalidation": "",
  "noTradeConditions": "",
  "patienceRating": "Immediate | Wait for confirmation | Be patient | No trade",
  "confidenceScore": 0,
  "executionQuality": "",

  "mostImportantThing": "",
  "keyLevels": "",
  "marketStructure": "",
  "bullishScenario": "",
  "bullishConditions": "",
  "bearishScenario": "",
  "bearishConditions": "",
  "bullishScore": 0,
  "bearishScore": 0,
  "scoreReason": "",
  "finalDecision": ""
}

Field rules:
- htfBias: higher timeframe directional context.
- executionBias: what lower/execution timeframes suggest.
- liquidityContext: where liquidity likely sits and whether price is close to a trap zone.
- invalidation: what would make the current idea invalid.
- noTradeConditions: exact conditions where user should stay out.
- patienceRating: one of the allowed patience labels.
- confidenceScore: 0–100 clarity score.
- executionQuality: whether conditions are good enough for execution or not.
- finalDecision: strict, cautious and actionable.
`,
      },
    ];

    for (const item of imageInputs) {
      content.push({
        type: "input_text",
        text: `${item.timeframe} chart screenshot:`,
      });

      content.push({
        type: "input_image",
        image_url: item.imageUrl,
      });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content,
        },
      ],
    });

    let parsedAnalysis;

    try {
      parsedAnalysis = JSON.parse(response.output_text);
    } catch {
      parsedAnalysis = {
        overallBias: "Unclear",
        tradeQuality: "No Trade",
        marketState: "Unclear",
        noTradeReason:
          "The AI response could not be parsed clearly, so the setup should be treated as no trade.",
        htfBias: "Unclear",
        executionBias: "No Trade",
        liquidityContext: "No reliable liquidity context could be extracted.",
        invalidation: "No reliable invalidation condition could be extracted.",
        noTradeConditions: "Do not trade because the analysis could not be parsed reliably.",
        patienceRating: "No trade",
        confidenceScore: 0,
        executionQuality: "Not suitable for execution.",
        mostImportantThing:
          "The AI response could not be parsed clearly, so this should be treated as no trade.",
        keyLevels: "No reliable key levels could be extracted.",
        marketStructure: "Market structure could not be parsed reliably.",
        bullishScenario: "No reliable bullish scenario.",
        bullishConditions: "No reliable bullish conditions.",
        bearishScenario: "No reliable bearish scenario.",
        bearishConditions: "No reliable bearish conditions.",
        bullishScore: 0,
        bearishScore: 0,
        scoreReason: "The model response was not valid JSON.",
        finalDecision: "No trade until clearer structure is available.",
      };
    }

    const analysis = cleanAnalysis(parsedAnalysis);

    const { data: insertedAnalysis, error: insertError } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        market,
        instrument: instrument || null,
        trade_duration: tradeDuration,
        analysis,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("SUPABASE_INSERT_ERROR:", insertError);

      return Response.json(
        {
          error: "Analysis was created, but saving to history failed.",
          supabaseError: insertError.message,
        },
        { status: 500 }
      );
    }

    if (!isPro) {
      await supabase.from("user_usage").upsert({
        user_id: userId,
        last_free_analysis_at: new Date().toISOString(),
      });
    }

    return Response.json({
      success: true,
      analysisId: insertedAnalysis?.id,
      analysis,
    });
  } catch (error) {
    console.error("ANALYZE_ROUTE_ERROR:", error);

    return Response.json(
      {
        error: "AI analysis failed.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}