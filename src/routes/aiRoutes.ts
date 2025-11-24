import axios from "axios";
import { Request, Response } from "express";

export const generateContent = async (req: Request, res: Response) => {
  try {
    const { text, maxToken } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const aiResponse = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        prompt: {
          text
        },
        temperature: 0.7,
        maxOutputTokens: maxToken || 300
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GOOGLE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const generatedContent = aiResponse.data?.candidates?.[0]?.content?.[0]?.status,
      content = aiResponse.data?.candidates?.[0]?.content?.[0]?.content;

    if (!generatedContent) {
      return res.status(400).json({ error: "Generation failed" });
    }

    // Send back generated content
    res.json({ content: aiResponse.data });
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Generation failed" });
  }
};
