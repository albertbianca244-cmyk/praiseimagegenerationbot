import { Telegraf } from "telegraf";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!BOT_TOKEN || !OPENAI_API_KEY) {
  console.error("Missing BOT_TOKEN or OPENAI_API_KEY in environment variables.");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Simple in-memory rate limiting per user (optional, prevents abuse)
const userLastRequest = new Map();
const COOLDOWN_MS = 15000; // 15 seconds between requests

bot.start((ctx) => {
  ctx.reply(
    "👋 Welcome! Send me a text prompt and I'll generate an AI image for you.\n\n" +
    "Example: /generate a cat riding a skateboard in space"
  );
});

bot.help((ctx) => {
  ctx.reply(
    "Usage:\n" +
    "/generate <your prompt>\n\n" +
    "Example:\n/generate a futuristic city at sunset, digital art"
  );
});

bot.command("generate", async (ctx) => {
  const userId = ctx.from.id;
  const prompt = ctx.message.text.replace(/^\/generate(@\w+)?\s*/i, "").trim();

  if (!prompt) {
    return ctx.reply("Please provide a prompt. Example:\n/generate a dragon made of glass");
  }

  // Rate limit check
  const lastRequest = userLastRequest.get(userId) || 0;
  const now = Date.now();
  if (now - lastRequest < COOLDOWN_MS) {
    const waitSec = Math.ceil((COOLDOWN_MS - (now - lastRequest)) / 1000);
    return ctx.reply(`⏳ Please wait ${waitSec}s before generating another image.`);
  }
  userLastRequest.set(userId, now);

  const statusMsg = await ctx.reply("🎨 Generating your image, please wait...");

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data[0].url;

    await ctx.replyWithPhoto(imageUrl, {
      caption: `Prompt: "${prompt}"`,
    });
  } catch (error) {
    console.error("Image generation error:", error?.response?.data || error.message);
    await ctx.reply(
      "❌ Sorry, something went wrong generating that image. " +
      "This can happen if the prompt violates content policy, or the API is temporarily unavailable."
    );
  } finally {
    try {
      await ctx.deleteMessage(statusMsg.message_id);
    } catch (_) {
      // ignore if message already gone
    }
  }
});

// Fallback: treat any plain text message as a prompt too
bot.on("text", async (ctx) => {
  if (ctx.message.text.startsWith("/")) return; // ignore unknown commands
  ctx.reply("Tip: use /generate followed by your prompt, e.g.\n/generate a robot painting a mural");
});

bot.launch();
console.log("Bot is running...");

// Graceful shutdown (important for Railway restarts/deploys)
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
