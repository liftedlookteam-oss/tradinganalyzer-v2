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
Planned trade duration: ${tradeDuration}

You are analyzing multiple chart screenshots from different timeframes.

Your goal:
Give a practical trade decision-support analysis. Do NOT give blind buy/sell signals.

Important:
- Never say "buy", "sell", "go long", "go short", or "enter now".
- You may say "bullish setup is valid only if..." or "bearish setup is valid only if..."
- Final decision must be one of:
  - "No trade"
  - "Wait for confirmation"
  - "Bullish scenario favored only if..."
  - "Bearish scenario favored only if..."
- Do not give financial advice.
- Do not pretend certainty.
- If the chart is unclear, say No Trade.

Timeframe priority:
- Scalp: prioritize 5M, 15M, 1H. Higher timeframes only matter if they show immediate major resistance/support.
- Intraday: prioritize 15M, 1H, 4H.
- Session trade: prioritize 15M, 1H, 2H, 4H.
- Swing: prioritize 4H and Daily.
- Position: prioritize Daily and 4H.

Scoring rules:
- Scores are from 0 to 100.
- Never use 0–10 scale.
- If you write Good or High-quality, at least one scenario score should usually be above 60.
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

Return ONLY valid JSON in this exact structure:

{
  "overallBias": "Bullish | Bearish | Neutral | Unclear",
  "tradeQuality": "Bad | Moderate | Good | No Trade",
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
- mostImportantThing: one clear sentence about what matters most right now.
- keyLevels: 2–4 short points only. If exact price levels are not visible, describe zones generally.
- marketStructure: 2–3 clear sentences.
- bullishScenario: describe upside case without telling user to buy.
- bullishConditions: explain what must happen before bullish case is valid.
- bearishScenario: describe downside case without telling user to sell.
- bearishConditions: explain what must happen before bearish case is valid.
- finalDecision: strict and cautious.
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
        trade_status: "Not taken",
        trade_result: "Pending",
        risk_amount: "",
        risk_percent: "",
        emotion: "",
        journal_notes: "",
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