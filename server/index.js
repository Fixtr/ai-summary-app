import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/summarize", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "요약할 텍스트가 필요합니다." });
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
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
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text;

    res.json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI 요약 중 오류 발생" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
