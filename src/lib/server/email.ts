// src/lib/server/email.ts
import nodemailer from 'nodemailer';

if (!import.meta.env.VITE_SMTP_USERNAME || !import.meta.env.VITE_SMTP_PASSWORD) {
    console.error('GMAIL_USER or GMAIL_APP_PASSWORD environment variables are not set. Email sending will fail.');
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: import.meta.env.VITE_SMTP_USERNAME,
        pass: import.meta.env.VITE_SMTP_PASSWORD,
    },
    logger: true,
    debug: true,
});

const FROM_EMAIL = import.meta.env.VITE_SMTP_USERNAME; // Your Gmail address

export async function sendConfirmationEmail({ to, token }: { to: string; token: string }) {
    if (!import.meta.env.VITE_SMTP_USERNAME || !import.meta.env.VITE_SMTP_PASSWORD) {
        console.error('Email sending skipped: Gmail credentials not configured.');
        throw new Error('Email service not configured.');
    }

    // Use PUBLIC_APP_BASE_URL from $env/static/public
    const confirmationLink = `${import.meta.env.VITE_BASE_URL}/confirm-subscription?token=${token}`;

    try {
        console.log(`[Email Service] Attempting to send confirmation email to: ${to} using Gmail.`);
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

        console.log('[Email Service] Email sent successfully via Gmail. Message ID:', info.messageId);
        return info;
    } catch (error: any) {
        console.error('[Email Service] Error sending email via Gmail:', error);
        if (error.response) {
            console.error('[Email Service] Gmail SMTP Response:', error.response);
        }
        throw error;
    }
}