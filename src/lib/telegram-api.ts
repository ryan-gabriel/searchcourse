/**
 * Minimal Telegram Bot API client.
 *
 * Reads the bot token at call time (not module load) so the webhook route
 * and local scripts can share it without failing when env vars are absent.
 */

import axios from 'axios';

function getTelegramErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.description || error.message;
  }
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('Telegram send failed: TELEGRAM_BOT_TOKEN is not set');
    return false;
  }

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      // User-supplied text is never sent back with a parse mode, so it
      // cannot be interpreted as Markdown/HTML.
      disable_web_page_preview: true,
    });
    return true;
  } catch (error) {
    console.error('Telegram send failed:', getTelegramErrorMessage(error));
    return false;
  }
}
