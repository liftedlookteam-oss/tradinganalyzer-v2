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

  if (!Number.isFinite(score)) {
    return 0;
  }

  if (score > 0 && score <= 10) {
    return Math.round(score * 10);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function cleanAnalysis(rawAnalysis: any) {
  const bullishScore = normalizeScore(rawAnalysis?.bullishScore);
  const bearishScore = normalizeScore(rawAnalysis?.bearishScore);

  return {
    overallBias: rawAnalysis?.overallBias || "Unclear",
    tradeQuality: rawAnalysis?.tradeQuality || "No Trade",
    marketState: rawAnalysis?.marketState || "Unclear",
    noTradeReason: rawAnalysis?.noTradeReason || "",
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
    bullishScore,
    bearishScore,
    scoreReason: rawAnalysis?.scoreReason || "",
    finalDecision:
      rawAnalysis?.finalDecision ||
      "No trade until clearer confirmation appears.",
  };
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
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

Your job:
Give a practical, disciplined, market-state-based analysis. The user needs to understand what condition the market is in right now and whether there is a clear edge.

Do NOT give blind trade signals.

Strict language rules:
- Never say "buy now", "sell now", "enter now", "go long now", or "go short now".
- Do not give financial advice.
- Do not pretend certainty.
- You may say:
  - "Bullish scenario is valid only if..."
  - "Bearish scenario is valid only if..."
  - "Wait for confirmation..."
  - "No trade because..."
- If setup is unclear, say No Trade clearly.

Market state classification:
You must classify the marketState as exactly one of:
- Trending
- Ranging
- Pullback
- Breakout
- Reversal attempt
- Choppy / No edge
- Unclear

No-trade discipline:
- If price is in chop, unclear range, late move, mixed timeframe conflict, or directly into nearby support/resistance, tradeQuality should be "No Trade" or "Bad".
- If tradeQuality is "No Trade", noTradeReason must explain the exact reason.
- If tradeQuality is not "No Trade", noTradeReason can be empty.

Timeframe priority:
- Scalp: prioritize 5M, 15M, 1H. Higher timeframes only matter if they show immediate major support/resistance.
- Intraday: prioritize 15M, 1H, 4H.
- Session trade: prioritize 15M, 1H, 2H, 4H.
- Swing: prioritize 4H and Daily.
- Position: prioritize Daily and 4H.

Score rules:
- Scores are from 0 to 100.
- Never use 0–10 scale.
- If you write Good, at least one scenario score should usually be above 60.
- If both scenario scores are below 40, tradeQuality must be Bad or No Trade.
- Scores above 75 should be rare and require strong alignment across relevant timeframes.
- If the setup is mixed, both scores should usually stay between 35 and 65.
- Bullish and bearish scores do not need to add to 100.
- Scores must match your written analysis.

Output style:
- Specific.
- Short.
- Practical.
- No generic textbook explanations.
- Prefer conditions over predictions.

Return ONLY valid JSON in this exact structure:

{
  "overallBias": "Bullish | Bearish | Neutral | Unclear",
  "tradeQuality": "Bad | Moderate | Good | No Trade",
  "marketState": "Trending | Ranging | Pullback | Breakout | Reversal attempt | Choppy / No edge | Unclear",
  "noTradeReason": "",
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