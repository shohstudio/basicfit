export async function sendWebhook(eventType: string, payload: any) {
    const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

    // If no webhook URL is configured, just skip (don't break the app)
    if (!WEBHOOK_URL) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Webhook Skipped] Event: ${eventType}`, payload);
        }
        return;
    }

    try {
        // We MUST await fetch in Vercel Serverless, otherwise it may be cancelled
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_type: eventType,
                timestamp: new Date().toISOString(),
                ...payload
            })
        });

    } catch (error) {
        console.error("Webhook Execution Error:", error);
    }
}
