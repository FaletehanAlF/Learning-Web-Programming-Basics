import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Assistant server berjalan!",
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Pertanyaan tidak boleh kosong.",
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      instructions:
        "Kamu adalah AI Assistant untuk website Panduan Jurusan. Bantu siswa memahami dan memilih jurusan kuliah berdasarkan minat, kemampuan, mata pelajaran yang disukai, dan tujuan karier. Jawab dalam bahasa Indonesia yang mudah dipahami. Jika informasi pengguna belum cukup, ajukan pertanyaan lanjutan.",
      input: message,
    });

    res.json({
      success: true,
      reply: response.output_text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghubungi AI.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI Assistant server berjalan di http://localhost:${PORT}`);
});