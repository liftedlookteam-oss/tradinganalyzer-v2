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
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const market = formData.get("market") as string;

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

The user uploaded multiple chart screenshots from different timeframes.
Analyze them as a multi-timeframe setup.

Important rules:
- Do NOT give direct buy/sell signals.
- Do NOT pretend certainty.
- Respect higher-timeframe context before lower-timeframe execution.
- If the setup is unclear, say No Trade.
- Keep every answer short, specific and easy to understand.
- Avoid generic textbook language.
- Do not invent exact price levels unless they are clearly visible.

Return ONLY valid JSON in this exact structure:

{
  "overallBias": "Bullish | Bearish | Neutral | Unclear",
  "tradeQuality": "Bad | Moderate | Good | No Trade",
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
- keyLevels: max 2-4 short bullet-style points.
- marketStructure: max 2-3 clear sentences.
- bullishScenario: explain the upside case.
- bullishConditions: explain exactly what must happen for bullish scenario to be valid.
- bearishScenario: explain the downside case.
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