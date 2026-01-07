import twilio from 'twilio';

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER!;

// Create Twilio client
let twilioClient: twilio.Twilio | null = null;

function getTwilioClient() {
    if (!twilioClient && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    }

    // Validate number format
    if (TWILIO_WHATSAPP_NUMBER && !TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')) {
        console.warn(`WARNING: TWILIO_WHATSAPP_NUMBER (${TWILIO_WHATSAPP_NUMBER}) should start with 'whatsapp:'. Auto-fixing for this session, but please update your .env file.`);
    }

    return twilioClient;
}

/**
 * Send referee invitation via WhatsApp
 */
export async function sendRefereeInvitationWhatsApp(
    refereePhone: string,
    refereeName: string,
    chatUrl: string,
    jobTitle: string,
    companyName: string
): Promise<void> {
    const client = getTwilioClient();
    if (!client) {
        console.warn('Twilio client not configured. WhatsApp message not sent.');
        return;
    }

    const formattedPhone = refereePhone.startsWith('whatsapp:')
        ? refereePhone
        : `whatsapp:${refereePhone}`;

    // Ensure chatUrl has a protocol
    let formattedChatUrl = chatUrl;
    if (!formattedChatUrl.startsWith('http://') && !formattedChatUrl.startsWith('https://')) {
        formattedChatUrl = `https://${formattedChatUrl}`;
    }

    const message = `Hello ${refereeName},

A recruiter from *${companyName}* has requested to contact you as a reference for a candidate who applied for the position of *${jobTitle}*.

You can securely communicate with the recruiter through our encrypted chat system. No account creation is required.


🔗 Access Secure Chat:
${formattedChatUrl}

⚠️ *Important:* This link is unique and secure. Do not share it with anyone else.

If you did not expect this message or believe it was sent in error, please disregard it.

_This is an automated message from the Recruitment Verification Platform._`;

    try {
        await client.messages.create({
            body: message,
            from: TWILIO_WHATSAPP_NUMBER,
            to: formattedPhone,
        });
        console.log(`WhatsApp referee invitation sent to ${refereePhone}`);
    } catch (error) {
        console.error('Error sending WhatsApp referee invitation:', error);
        throw error;
    }
}

/**
 * Send new message notification via WhatsApp
 */
export async function sendNewMessageNotificationWhatsApp(
    recipientPhone: string,
    recipientName: string,
    chatUrl: string
): Promise<void> {
    const client = getTwilioClient();
    if (!client) {
        console.warn('Twilio client not configured. WhatsApp message not sent.');
        return;
    }

    const formattedPhone = recipientPhone.startsWith('whatsapp:')
        ? recipientPhone
        : `whatsapp:${recipientPhone}`;

    // Ensure chatUrl has a protocol (http:// or https://) for WhatsApp clickability
    let formattedChatUrl = chatUrl;
    if (!formattedChatUrl.startsWith('http://') && !formattedChatUrl.startsWith('https://')) {
        formattedChatUrl = `https://${formattedChatUrl}`;
    }

    const message = `Hello ${recipientName},

💬 You have received a new message in your chat.


🔗 View Message:
${formattedChatUrl}

_This is an automated notification from the Recruitment Verification Platform._`;

    try {
        await client.messages.create({
            body: message,
            from: TWILIO_WHATSAPP_NUMBER,
            to: formattedPhone,
        });
        console.log(`WhatsApp new message notification sent to ${recipientPhone}`);
    } catch (error) {
        console.error('Error sending WhatsApp new message notification:', error);
    }
}

/**
 * Send application status update via WhatsApp
 */
export async function sendApplicationStatusUpdateWhatsApp(
    employeePhone: string,
    employeeName: string,
    jobTitle: string,
    status: string,
    feedback?: string
): Promise<void> {
    const client = getTwilioClient();
    if (!client) {
        console.warn('Twilio client not configured. WhatsApp message not sent.');
        return;
    }

    const formattedPhone = employeePhone.startsWith('whatsapp:')
        ? employeePhone
        : `whatsapp:${employeePhone}`;

    const statusMessages: Record<string, string> = {
        SUBMITTED: 'Your application has been submitted successfully.',
        UNDER_REVIEW: 'Your application is now under review.',
        REFEREE_CONTACTED: 'We have contacted your references.',
        VERIFIED: 'Your references have been verified.',
        REJECTED: 'Unfortunately, we will not be moving forward with your application.',
        HIRED: 'Congratulations! You have been selected for the position.',
    };

    const statusEmoji: Record<string, string> = {
        SUBMITTED: '✅',
        UNDER_REVIEW: '🔍',
        REFEREE_CONTACTED: '📞',
        VERIFIED: '✔️',
        REJECTED: '❌',
        HIRED: '🎉',
    };

    const message = `Hello ${employeeName},

${statusEmoji[status] || '📋'} *Application Status Update*

Your application for *${jobTitle}* has been updated.

*Status:* ${status.replace('_', ' ')}

${statusMessages[status] || 'Your application status has been updated.'}${feedback ? `\n\n*Feedback:* ${feedback}` : ''}

_This is an automated message from the Recruitment Verification Platform._`;

    try {
        await client.messages.create({
            body: message,
            from: TWILIO_WHATSAPP_NUMBER,
            to: formattedPhone,
        });
        console.log(`WhatsApp application status update sent to ${employeePhone}`);
    } catch (error) {
        console.error('Error sending WhatsApp application status update:', error);
    }
}
