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
      rawAnalysis?.liquidityContext ||
      "Liquidity context is unclear.",

    invalidation:
      rawAnalysis?.invalidation ||
      "No clear invalidation identified.",

    noTradeConditions:
      rawAnalysis?.noTradeConditions ||
      "No clear no-trade conditions identified.",

    patienceRating:
      rawAnalysis?.patienceRating ||
      "Wait for confirmation",

    confidenceScore: normalizeScore(
      rawAnalysis?.confidenceScore
    ),

    executionQuality:
      rawAnalysis?.executionQuality ||
      "Execution quality is unclear.",
chartAnnotations:
  rawAnalysis?.chartAnnotations ||
  "No clear chart annotation plan available.",

    mostImportantThing:
      rawAnalysis?.mostImportantThing ||
      "No important observation identified.",

    keyLevels:
      rawAnalysis?.keyLevels ||
      "No key levels identified.",

    marketStructure:
      rawAnalysis?.marketStructure ||
      "Market structure is unclear.",

    bullishScenario:
      rawAnalysis?.bullishScenario ||
      "No bullish scenario identified.",

    bullishConditions:
      rawAnalysis?.bullishConditions ||
      "No bullish confirmation conditions.",

    bearishScenario:
      rawAnalysis?.bearishScenario ||
      "No bearish scenario identified.",

    bearishConditions:
      rawAnalysis?.bearishConditions ||
      "No bearish confirmation conditions.",

    bullishScore: normalizeScore(
      rawAnalysis?.bullishScore
    ),

    bearishScore: normalizeScore(
      rawAnalysis?.bearishScore
    ),

    scoreReason:
      rawAnalysis?.scoreReason ||
      "No score reasoning provided.",

    finalDecision:
      rawAnalysis?.finalDecision ||
      "No trade until clearer confirmation appears.",
  };
}

function isWithinLast24Hours(
  dateValue: string | null
) {
  if (!dateValue) return false;

  const lastUsed = new Date(dateValue).getTime();
  const now = Date.now();

  return (
    now - lastUsed <
    24 * 60 * 60 * 1000
  );
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { data: subscription } =
      await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();

    const isPro =
      subscription?.status === "active";

    if (!isPro) {
      const { data: usage } =
        await supabase
          .from("user_usage")
          .select("last_free_analysis_at")
          .eq("user_id", userId)
          .maybeSingle();

      if (
        usage &&
        isWithinLast24Hours(
          usage.last_free_analysis_at
        )
      ) {
        return Response.json(
          {
            error:
              "Free daily analysis already used.",
            code: "FREE_LIMIT_REACHED",
          },
          { status: 402 }
        );
      }
    }

    const formData =
      await request.formData();

    const market = formData.get(
      "market"
    ) as string;

    const instrument = (
      (formData.get(
        "instrument"
      ) as string) || ""
    ).trim();

    const tradeDuration =
      formData.get(
        "tradeDuration"
      ) as string;

    const imageInputs = [];

    for (const key of Object.keys(
      timeframeLabels
    )) {
      const image = formData.get(
        key
      ) as File | null;

      if (image && image.size > 0) {
        const bytes =
          await image.arrayBuffer();

        const buffer = Buffer.from(bytes);

        const base64Image =
          buffer.toString("base64");

        imageInputs.push({
          timeframe:
            timeframeLabels[key],
          imageUrl: `data:${image.type};base64,${base64Image}`,
        });
      }
    }

    if (imageInputs.length < 2) {
      return Response.json(
        {
          error:
            "At least 2 timeframe images are required.",
        },
        { status: 400 }
      );
    }

    const content: any[] = [
      {
        type: "input_text",
        text: `
You are a professional trading decision-support assistant.

IMPORTANT:
Your analysis must be CONSISTENT.

If the same charts are analyzed multiple times, the scores and conclusions should remain nearly identical unless chart structure meaningfully changes.

Do NOT randomly change scores.

Market type: ${market}
Instrument: ${instrument || "Not provided"}
Planned trade duration: ${tradeDuration}

The screenshots are the primary source of truth.

STRICT RULES:
- Never force a trade.
- WAIT and NO TRADE are professional outcomes.
- Do not use hype language.
- Do not pretend certainty.
- Use conditional reasoning.

You must analyze:
- Higher timeframe alignment
- Market structure
- Liquidity
- Trend quality
- Execution quality
- Risk clarity
- Invalidations
- Whether there is an actual edge
- Visual chart annotation opportunities

MARKET STATE must be exactly one of:
- Trending
- Ranging
- Pullback
- Breakout
- Reversal attempt
- Choppy / No edge
- Unclear

SCORING RUBRIC:

90-100:
Extremely rare.
Exceptional alignment across timeframes with very strong confirmation and clean structure.

75-89:
Strong setup with clear alignment, strong structure and good execution quality.

60-74:
Decent setup with some confirmation but still missing something important.

45-59:
Mixed conditions. Direction exists but edge is weak or incomplete.

30-44:
Weak setup. Poor alignment or poor structure.

0-29:
No clear edge. Avoid trading.

IMPORTANT:
- Same chart context should produce similar scores.
- Do NOT randomly shift scores by 10-20 points.
- If setup quality is similar, scores must remain similar.
- If both bullish and bearish cases are weak, keep both scores low.
- Scores above 75 should be rare.
- Choppy markets should usually stay below 50.
chartAnnotations should describe what a trader should visually mark on the chart:
- liquidity areas
- key zones
- invalidation areas
- wait zones
- execution areas
- sweeps
- breakout areas

Do not invent exact prices unless clearly visible.
Return ONLY valid JSON in this structure:

{
  "overallBias": "",
  "tradeQuality": "",
  "marketState": "",
  "noTradeReason": "",

  "htfBias": "",
  "executionBias": "",

  "liquidityContext": "",
  "invalidation": "",
  "noTradeConditions": "",

  "patienceRating": "",
  "confidenceScore": 0,
  "executionQuality": "",
"chartAnnotations": "",

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

    const response =
      await openai.responses.create({
        model: "gpt-4.1-mini",
        temperature: 0,
        input: [
          {
            role: "user",
            content,
          },
        ],
      });

    let parsedAnalysis;

    try {
      parsedAnalysis = JSON.parse(
        response.output_text
      );
    } catch {
      parsedAnalysis = {
        overallBias: "Unclear",
        tradeQuality: "No Trade",
        marketState: "Unclear",
        noTradeReason:
          "AI response could not be parsed.",

        htfBias: "Unclear",
        executionBias: "No Trade",

        liquidityContext:
          "Liquidity context unavailable.",

        invalidation:
          "Invalidation unavailable.",

        noTradeConditions:
          "No-trade conditions unavailable.",

        patienceRating: "No trade",
        confidenceScore: 0,

        executionQuality:
          "Execution quality unavailable.",

        mostImportantThing:
          "No reliable conclusion available.",

        keyLevels:
          "No reliable levels available.",

        marketStructure:
          "Market structure unavailable.",

        bullishScenario:
          "No bullish scenario.",

        bullishConditions:
          "No bullish conditions.",

        bearishScenario:
          "No bearish scenario.",

        bearishConditions:
          "No bearish conditions.",

        bullishScore: 0,
        bearishScore: 0,

        scoreReason:
          "Model returned invalid JSON.",

        finalDecision:
          "No trade until clearer confirmation appears.",
      };
    }

    const analysis =
      cleanAnalysis(parsedAnalysis);

    const {
      data: insertedAnalysis,
      error: insertError,
    } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        market,
        instrument:
          instrument || null,
        trade_duration:
          tradeDuration,
        analysis,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(
        "SUPABASE_INSERT_ERROR:",
        insertError
      );

      return Response.json(
        {
          error:
            "Analysis was created, but saving failed.",
        },
        { status: 500 }
      );
    }

    if (!isPro) {
      await supabase
        .from("user_usage")
        .upsert({
          user_id: userId,
          last_free_analysis_at:
            new Date().toISOString(),
        });
    }

    return Response.json({
      success: true,
      analysisId:
        insertedAnalysis?.id,
      analysis,
    });
  } catch (error) {
    console.error(
      "ANALYZE_ROUTE_ERROR:",
      error
    );

    return Response.json(
      {
        error: "AI analysis failed.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}