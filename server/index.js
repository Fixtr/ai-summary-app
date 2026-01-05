import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/** middleware */
app.use(cors());
app.use(express.json());

/** OpenAI client */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** health check */
app.get("/", (req, res) => {
  res.send("SERVER OK");
});

/** summarize API */
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "EXISTS" : "MISSING");
app.post("/summarize", async (req, res) => {
  console.log("✅ POST /summarize HIT");

  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({
      error: "요약할 텍스트가 필요합니다."
    });
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: "너는 글을 핵심만 간결하게 요약하는 도우미다."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_output_tokens: 300
    });

    const summary =
      response.output_text ??
      response.output?.[0]?.content?.[0]?.text ??
      "요약 결과를 생성하지 못했습니다.";

    res.json({ summary });
  } catch (error) {
    console.error("🔥 OpenAI ERROR:", error);
    res.status(500).json({
      error: error.message || "AI 요약 중 오류 발생"
    });
  }
});

/** server start */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
