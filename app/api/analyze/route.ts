import OpenAI from "openai";

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

The user uploaded multiple chart screenshots from different timeframes.
Analyze them as a multi-timeframe setup, but prioritize the analysis according to the planned holding period.

Timeframe priority rules:
- If planned duration is Scalp: prioritize 5M, 15M and 1H. Do not over-weight Daily or 4H unless they show a major obstacle nearby.
- If planned duration is Intraday: prioritize 15M, 1H and 4H.
- If planned duration is Session trade: prioritize 15M, 1H, 2H and 4H.
- If planned duration is Swing: prioritize 4H and Daily, then use 1H/15M only for timing.
- If planned duration is Position: prioritize Daily and 4H. Lower timeframes are secondary noise unless they show execution timing.

Important rules:
- Do NOT give direct buy/sell signals.
- Do NOT pretend certainty.
- If the setup is unclear, say No Trade.
- Keep every answer short, specific and easy to understand.
- Avoid generic textbook language.
- Do not invent exact price levels unless they are clearly visible.
- The final decision must match the planned trade duration.
- For scalps, do not reject the setup only because Daily/4H is mixed, unless higher timeframe shows immediate major resistance/support.
- For swing/position trades, do not over-focus on 5M/15M noise.
- The "mostImportantThing" must be the clearest single thing the trader should pay attention to right now.
- It should be practical, direct and specific.
- Examples:
  - "Wait for a clean break and retest of the current range high."
  - "Do not chase here; price is extended into resistance."
  - "No clear edge until liquidity is swept and structure confirms."
  - "The short-term setup is bullish, but only while 15M structure holds."

Scoring rules:
- Scores above 70 should be rare.
- Only use 70+ when there is clean confluence across relevant timeframes.
- If conditions are mixed, keep both scores moderate.
- If the setup is unclear, tradeQuality must be "No Trade".

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

Guidelines:
- mostImportantThing: one clear sentence.
- keyLevels: max 2-4 short bullet-style points.
- marketStructure: max 2-3 clear sentences.
- bullishScenario: explain the upside case based on the selected trade duration.
- bullishConditions: explain exactly what must happen for bullish scenario to be valid.
- bearishScenario: explain the downside case based on the selected trade duration.
- bearishConditions: explain exactly what must happen for bearish scenario to be valid.
- bullishScore and bearishScore must be numbers from 0 to 100.
- finalDecision must be strict: trade, wait, or no trade.
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
        mostImportantThing: "The AI response could not be parsed clearly. Treat this as no trade.",
        keyLevels: "Could not parse structured key levels.",
        marketStructure: "The AI response could not be parsed into structured JSON.",
        bullishScenario: "",
        bullishConditions: "",
        bearishScenario: "",
        bearishConditions: "",
        bullishScore: 0,
        bearishScore: 0,
        scoreReason: "The response was not valid JSON.",
        finalDecision: response.output_text,
      };
    }

    return Response.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "AI analysis failed." },
      { status: 500 }
    );
  }
}