import nodemailer from 'nodemailer';

// Keep your original environment variable access
if (!import.meta.env.VITE_SMTP_USERNAME || !import.meta.env.VITE_SMTP_PASSWORD) {
    console.error('SMTP credentials are not set. Email sending will fail');
}

const transporter = nodemailer.createTransport({
    host: import.meta.env.VITE_SMTP_HOST,
    port: import.meta.env.VITE_SMTP_PORT,
    secure: true,
    auth: {
        user: import.meta.env.VITE_SMTP_USERNAME,
        pass: import.meta.env.VITE_SMTP_PASSWORD,
    },
    logger: true,
    debug: true,
});

const FROM_EMAIL = import.meta.env.VITE_SMTP_USERNAME;

export async function sendConfirmationEmail({ to, token }: { to: string; token: string }) {
    if (!import.meta.env.VITE_SMTP_USERNAME || !import.meta.env.VITE_SMTP_PASSWORD) {
        console.error('Email sending skipped: SMTP credentials not configured.');
        throw new Error('Email service not configured.');
    }

    // Use the same base URL approach as your original
    const confirmationLink = `${import.meta.env.VITE_BASE_URL}/confirm-subscription?token=${token}`;

    try {
        console.log(`[Email Service] Attempting to send confirmation email to: ${to}`);
        const info = await transporter.sendMail({
            from: FROM_EMAIL,
            to: to,
            subject: 'Confirm Your Subscription to Our Mailing List',
            html: `
                <p>Hello,</p>
                <p>Thank you for subscribing to our mailing list!</p>
                <p>Please click the link below to confirm your subscription:</p>
                <p><a href="${confirmationLink}">Confirm My Subscription</a></p>
                <p>If you did not subscribe to this mailing list, you can ignore this email.</p>
                <p>Thank you,<br>Your Team</p>
            `,
            text: `Hello,\n\nThank you for subscribing to our mailing list!\n\nPlease click the link below to confirm your subscription:\n\n${confirmationLink}\n\nIf you did not subscribe to this mailing list, you can ignore this email.\n\nThank you,\nYour Team`,
        });

        console.log('[Email Service] Email sent successfully. Message ID:', info.messageId);
        return info;
    } catch (error: any) {
        console.error('[Email Service] Error sending email:', error);
        if (error.response) {
            console.error('[Email Service] SMTP Response:', error.response);
        }
        throw error;
    }
}