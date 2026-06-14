import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

async function createTransporter() {
  if (transporter) return transporter;
  try {
    const { default: nodemailer } = await import('nodemailer');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  } catch (err) {
    // nodemailer not installed or failed to import — fall back to a no-op transporter
    console.warn('nodemailer not available, using stub mailer. Install nodemailer to enable email delivery.');
    transporter = {
      sendMail: async (opts) => {
        console.log('[stub mailer] sendMail called with:', opts);
        return { accepted: Array.isArray(opts.to) ? opts.to : [opts.to], messageId: 'stub' };
      }
    };
    return transporter;
  }
}

export async function sendEmail({ to, subject, text, html }) {
  const t = await createTransporter();
  if (!t) throw new Error('Email transporter is not configured');
  return t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}
