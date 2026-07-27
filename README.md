# Praise Image Generation Bot

A Telegram bot that generates AI images from text prompts using OpenAI's DALL·E 3.

## Setup

1. Create a bot with [@BotFather](https://t.me/BotFather) on Telegram, get your `BOT_TOKEN`.
2. Get an API key from https://platform.openai.com/api-keys
3. Clone this repo, run `npm install`
4. Copy `.env.example` to `.env` and fill in your keys
5. Run locally: `npm start`

## Deploy on Railway

1. Push this repo to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub repo
3. Select this repo
4. In Railway's project settings → Variables, add:
   - `BOT_TOKEN`
   - `OPENAI_API_KEY`
5. Railway will detect the `Procfile` and run `node index.js`
6. Check the deployment logs — you should see "Bot is running..."

## Usage

In Telegram, message your bot:
```
/generate a cat riding a skateboard in space
```
