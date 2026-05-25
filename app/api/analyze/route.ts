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

Analyze the uploaded chart screenshots as a multi-timeframe setup.

Return ONLY valid JSON:

{
  "overallBias": "",
  "tradeQuality": "",
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

    let analysis;

    try {
      analysis = JSON.parse(response.output_text);
    } catch {
      analysis = {
        overallBias: "Unclear",
        tradeQuality: "No Trade",
        mostImportantThing: "The AI response could not be parsed clearly.",
        keyLevels: "",
        marketStructure: "",
        bullishScenario: "",
        bullishConditions: "",
        bearishScenario: "",
        bearishConditions: "",
        bullishScore: 0,
        bearishScore: 0,
        scoreReason: "",
        finalDecision: "No trade.",
      };
    }

    const { error: insertError } = await supabase.from("analyses").insert({
      user_id: userId,
      market,
      trade_duration: tradeDuration,
      analysis,
    });

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