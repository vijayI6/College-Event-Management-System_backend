import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    let transporter;

    // Use SMTP environment variables if provided
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587', 10),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        // Fallback for development/testing: Ethereal Email SMTP test account
        console.log('\n--- DEVELOPMENT EMAIL LOG ---');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body (Text):\n${options.text}`);
        console.log('-----------------------------\n');

        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log(`Created temporary Ethereal SMTP test account: ${testAccount.user}`);
        } catch (err) {
            console.warn('Unable to create Ethereal SMTP account. Falling back to console-only mode.');
            return {
                messageId: 'console-only-id-' + Date.now(),
                previewUrl: null
            };
        }
    }

    const message = {
        from: `"${process.env.FROM_NAME || 'CampusEvents'}" <${process.env.FROM_EMAIL || 'no-reply@campusevents.com'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    const info = await transporter.sendMail(message);

    console.log(`Email message sent successfully. Message ID: ${info.messageId}`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log(`Ethereal Email Preview URL: ${previewUrl}`);
    }

    return {
        messageId: info.messageId,
        previewUrl: previewUrl
    };
};

export default sendEmail;
