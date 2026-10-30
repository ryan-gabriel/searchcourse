/**
 * Register the Telegram feedback webhook.
 *
 * Run once after deployment (and again whenever the public URL or secret
 * changes):
 *
 *   npm run telegram:setup
 *
 * Requires a public HTTPS URL. For local development, expose the dev server
 * with a tunnel and set SITE_BASE_URL to the tunnel URL.
 */

import axios from 'axios';
import { pathToFileURL } from 'url';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SITE_BASE_URL = process.env.SITE_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

function getTelegramErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.description || error.message;
    }
    return error instanceof Error ? error.message : 'Unknown error';
}

export async function registerWebhook() {
    if (!BOT_TOKEN) {
        throw new Error('TELEGRAM_BOT_TOKEN is required');
    }
    if (!SITE_BASE_URL) {
        throw new Error('SITE_BASE_URL (or NEXT_PUBLIC_APP_URL) is required');
    }
    if (!WEBHOOK_SECRET) {
        throw new Error('TELEGRAM_WEBHOOK_SECRET is required');
    }

    const webhookUrl = `${SITE_BASE_URL.replace(/\/$/, '')}/api/telegram/webhook`;
    const api = `https://api.telegram.org/bot${BOT_TOKEN}`;

    console.log(`Registering webhook: ${webhookUrl}`);

    const response = await axios.post(`${api}/setWebhook`, {
        url: webhookUrl,
        secret_token: WEBHOOK_SECRET,
        allowed_updates: ['message'],
    });

    console.log(response.data.description || 'Webhook registered.');

    const info = await axios.get(`${api}/getWebhookInfo`);
    console.log('Webhook info:', JSON.stringify(info.data.result, null, 2));
}

async function main() {
    try {
        await registerWebhook();
    } catch (error) {
        console.error('❌ Webhook setup failed:', getTelegramErrorMessage(error));
        process.exit(1);
    }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
    main();
}
