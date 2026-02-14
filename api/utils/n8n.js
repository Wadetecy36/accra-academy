/**
 * Automation Utility (n8n)
 * Handles triggering of n8n webhooks for background workflows.
 */

/**
 * Send data to n8n webhook.
 * 
 * @param {string} event - The type of event (e.g., 'student_enrolled')
 * @param {object} data - The payload to send
 */
const sendToN8n = async (event, data) => {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
        // Using dynamic import for node-fetch if needed, or global fetch in Node 18+
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event,
                data,
                timestamp: new Date().toISOString()
            }),
        });

        if (response.ok) {
            console.log(`🚀 n8n Webhook Triggered: ${event}`);
        } else {
            console.warn(`⚠️ n8n Webhook returned status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ n8n Webhook error: ${error.message}`);
    }
};

module.exports = { sendToN8n };
