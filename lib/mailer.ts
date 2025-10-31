import nodemailer from 'nodemailer'

const gmailUser = process.env.GMAIL_USER
const gmailAppPassword = process.env.GOOGLE_APP_PASSWORD

const smtpHost = process.env.SMTP_HOST
const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const mailFrom = process.env.MAIL_FROM || gmailUser || smtpUser

export const mailer = gmailUser && gmailAppPassword
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      pool: true,
    })
  : nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
      pool: true,
      maxConnections: 1,
      maxMessages: Infinity,
      connectionTimeout: 10_000,
      socketTimeout: 10_000,
    })

let verifyPromise: Promise<void> | null = null
async function ensureTransportReady() {
  if (!verifyPromise) {
    verifyPromise = new Promise((resolve, reject) => {
      mailer.verify((err: unknown) => (err ? reject(err) : resolve()))
    })
  }
  return verifyPromise
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!mailFrom) throw new Error('MAIL_FROM not configured')
  await ensureTransportReady()
  await mailer.sendMail({
    from: mailFrom,
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Reset your password</h2>
        <p>We received a request to reset your password. Click the button below to set a new password.</p>
        <p><a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Reset Password</a></p>
        <p>Or paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  })
}

export async function sendOTPEmail(to: string, otp: string) {
  if (!mailFrom) throw new Error('MAIL_FROM not configured')
  await ensureTransportReady()
  await mailer.sendMail({
    from: mailFrom,
    to,
    subject: 'Verify your email address - OTP',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px">
        <h2 style="color:#2563eb">Email Verification</h2>
        <p>Thank you for registering! Please verify your email address using the OTP below:</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
          <h1 style="color:#2563eb;font-size:36px;letter-spacing:8px;margin:0">${otp}</h1>
        </div>
        <p style="color:#6b7280;font-size:14px">This OTP will expire in 10 minutes. If you didn't request this, you can ignore this email.</p>
        <p style="color:#6b7280;font-size:14px">For testing purposes, you can also use the bypass code: <strong>0000</strong></p>
      </div>
    `,
  })
}


