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
        // Fire and forget - don't await response to speed up UI
        fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_type: eventType,
                timestamp: new Date().toISOString(),
                ...payload
            })
        }).catch(err => console.error("Webhook Fetch Error:", err));

    } catch (error) {
        console.error("Webhook Execution Error:", error);
    }
}
