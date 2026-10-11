# Drawe Telegram Bot Integration & Setup Guide

This guide details the complete configuration procedure for the Drawe Telegram Bot, Telegram Mini App, Webhook endpoints, and Operator/Admin notifications.

> **Important Architecture Note:**  
> Configuring `@BotFather` merely sets up the UI buttons and metadata inside Telegram. All command handling, dynamic capacity number generation (1–1000), tenant isolation, SHA-256 draw logic, and payment review are authoritatively executed by the Drawe backend and database services.

---

## 1. Create Bot Using @BotFather

1. Open Telegram and search for the official **[@BotFather](https://t.me/BotFather)** (verified with blue badge).
2. Start the chat and send the command:
   ```text
   /newbot
   ```
3. Enter your bot's display name:
   - Example: `Drawe Bot` (or in Amharic: `አደይ ዕጣ ቦት`)
4. Choose a unique username ending with `bot` or `_bot`:
   - Example: `DraweApp_bot` or `DraweOfficialBot`
5. `@BotFather` will reply with your **HTTP API Token**. It looks like:
   ```text
   7123456789:AAH1BC-example_token_abcdef123456789
   ```
   *Keep this token strictly confidential. Never commit it to Git repositories.*

---

## 2. Configure Display Name, Description, and About Text

In `@BotFather`:
1. Send `/mybots` and select your newly created bot.
2. Select **Edit Bot**:
   - **Edit Name**: Change the display title at any time.
   - **Edit Description**: Enter the text displayed when someone opens the bot for the first time:
     ```text
     🎮 Welcome to Drawe (አደይ ዕጣ) — The transparent number-draw platform.
     Select your numbers, participate in provably fair SHA-256 draws, and win!
     ```
   - **Edit About**: Short bio shown on the bot's profile card (up to 120 chars):
     ```text
     Official Drawe interactive number selection bot and Mini App.
     ```
   - **Edit Botpic**: Upload your platform logo.

---

## 3. Configure Bot Command List with `/setcommands`

Send the command to `@BotFather`:
```text
/setcommands
```
Select your bot, then copy and paste the exact command list below:

```text
start - Welcome message and open Drawe Mini App
operators - List verified active draw operators
draw - View active draw details and prizes
board - Open number selection board in Mini App
my_numbers - View your selected numbers and payments
payment - Operator payment guide and reference submission
status - Check your payment review status
results - View winning numbers from completed draws
help - Help guide and command documentation
```

---

## 4. Configure Telegram Mini App Menu Button

To enable the persistent **Menu Button** in the bottom-left corner of the Telegram chat:

1. In `@BotFather`, send `/mybots` and select your bot.
2. Click **Bot Settings** → **Menu Button** → **Configure menu button**.
3. Send the official Drawe Mini App URL:
   ```text
   https://drawe-sigma.vercel.app/
   ```
4. Send the button label:
   ```text
   🎮 Open Drawe
   ```
   *(or in Amharic: `ዕጣ ምረጥ 🎟️`)*

---

## 5. Webhook Architecture & Route Verification

The Drawe Express backend handles incoming updates via:

- **Webhook Route:** `POST /api/telegram/webhook`
- **Mini App Auth Route:** `POST /api/telegram/auth`
- **Config Route:** `GET /api/telegram/config`

### Production URLs:
- **Frontend / Mini App (Vercel):** `https://drawe-sigma.vercel.app/`
- **Backend (Render):** `https://drawe.onrender.com/`
- **Exact Webhook URL:** `https://drawe.onrender.com/api/telegram/webhook`

---

## 6. Required Render Backend Environment Variables

Configure these environment variables in your **Render Dashboard** (`Dashboard` → `Your Service` → `Environment`):

| Variable Name | Required | Description | Example / Recommended Value |
|---|:---:|---|---|
| `PORT` | Yes | Backend listening port | `3000` or `10000` (Render sets automatically) |
| `NODE_ENV` | Yes | Runtime environment | `production` |
| `APP_URL` | Yes | Public Web / Mini App URL | `https://drawe-sigma.vercel.app` |
| `API_URL` | Yes | Public Backend API URL | `https://drawe.onrender.com` |
| `TELEGRAM_MINI_APP_URL` | Yes | Mini App entry point | `https://drawe-sigma.vercel.app` |
| `TELEGRAM_BOT_TOKEN` | Yes | Bot token from @BotFather | `7123456789:AAH1BC-xyz...` |
| `TELEGRAM_BOT_USERNAME` | Yes | Bot username without `@` | `DraweApp_bot` |
| `TELEGRAM_WEBHOOK_SECRET` | Yes | Secret token for validating webhooks | Strong random string (e.g. 32+ hex chars) |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/adey_draw_db` |
| `JWT_SECRET` | Yes | Cryptographic key for user tokens | Secure random 256-bit string |

> **Security Rule:** Never prefix backend tokens with `VITE_`. Frontend bundles must never contain `TELEGRAM_BOT_TOKEN` or `TELEGRAM_WEBHOOK_SECRET`.

---

## 7. Safe Webhook Registration Procedure

Register the webhook with Telegram's Bot API using `curl`.

### Step 7.1: Set Webhook with Secret Token
Run this in your terminal (replace `<YOUR_BOT_TOKEN>` and `<YOUR_WEBHOOK_SECRET>`):

```bash
curl -F "url=https://drawe.onrender.com/api/telegram/webhook" \
     -F "secret_token=<YOUR_WEBHOOK_SECRET>" \
     -F "allowed_updates=[\"message\",\"callback_query\"]" \
     "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook"
```

Expected JSON response:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

### Step 7.2: Verify Webhook Status
Check your webhook health without exposing tokens in logs:

```bash
curl -s "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Expected healthy output:
```json
{
  "ok": true,
  "result": {
    "url": "https://drawe.onrender.com/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40,
    "ip_address": "...",
    "allowed_updates": ["message", "callback_query"]
  }
}
```

---

## 8. Troubleshooting Guide

### 1. `403 Forbidden` on Webhook
- **Cause:** The `X-Telegram-Bot-Api-Secret-Token` header sent by Telegram does not match `process.env.TELEGRAM_WEBHOOK_SECRET` on Render.
- **Fix:** Ensure the secret passed in `setWebhook` matches the value configured in Render environment variables.

### 2. `401 Unauthorized: Invalid or forged Telegram authentication payload`
- **Cause:** Mini App `initData` HMAC verification failed.
- **Fix:** Confirm `TELEGRAM_BOT_TOKEN` on Render matches the bot token from which the Mini App was opened. Note that Telegram `initData` expires after 24 hours (TTL check).

### 3. Webhook Retries / Duplicate Messages
- **Cause:** The server did not respond with HTTP `200` within 5 seconds.
- **Fix:** Drawe includes automatic `update_id` deduplication and returns HTTP 200 immediately to acknowledge Telegram updates. Check Render server logs if processing takes longer than expected.

### 4. Mini App Does Not Open or Shows Blank Screen
- **Cause:** Vercel frontend URL is not HTTPS or X-Frame-Options prevents embedding.
- **Fix:** Telegram requires HTTPS. Ensure `https://drawe-sigma.vercel.app/` does not send blocking `X-Frame-Options: DENY` headers for Telegram WebViews.

### 5. Admin Cannot Approve Payment via Telegram
- **Cause:** Telegram User ID is not linked to a platform `ADMIN` user, or the payment belongs to another tenant.
- **Fix:** Tenant isolation strictly prevents cross-tenant approval. Link the admin's Telegram User ID to the corresponding operator admin record in MongoDB.
