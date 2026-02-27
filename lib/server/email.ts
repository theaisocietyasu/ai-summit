import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "noreply@example.com";

interface RegistrantInfo {
  first_name: string;
  last_name: string;
  email: string;
  academic_year: string;
}

function baseHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>AI Summit</title>
</head>
<body style="margin:0;padding:0;background:#0D0716;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0716;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#12082a;border-radius:12px;border:1px solid #2d1b69;overflow:hidden;max-width:600px;">
      <tr>
        <td style="background:linear-gradient(135deg,#1a0a3e,#2d1b69);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;font-size:28px;font-weight:700;color:#a78bfa;letter-spacing:1px;">AI Summit</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#8b7cc8;">Arizona State University</p>
        </td>
      </tr>
      <tr><td style="padding:36px 40px;">
        ${body}
      </td></tr>
      <tr>
        <td style="background:#0a0520;padding:20px 40px;text-align:center;border-top:1px solid #2d1b69;">
          <p style="margin:0;font-size:12px;color:#6b5b9e;">© 2026 AI Society at ASU · AI Summit</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function sendApprovalEmail(
  registrant: RegistrantInfo,
  qrDataUri: string,
): Promise<void> {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#a78bfa;">You're In! 🎉</h2>
    <p style="margin:0 0 24px;font-size:16px;color:#c4b5fd;">Hi ${registrant.first_name}, your registration for AI Summit has been <strong style="color:#86efac;">approved</strong>.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a3e;border-radius:8px;border:1px solid #2d1b69;margin:0 0 28px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 6px;font-size:13px;color:#8b7cc8;text-transform:uppercase;letter-spacing:1px;">Registered As</p>
        <p style="margin:0;font-size:16px;color:#e2d9f3;">${registrant.first_name} ${registrant.last_name}</p>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <p style="margin:0 0 6px;font-size:13px;color:#8b7cc8;text-transform:uppercase;letter-spacing:1px;">Email</p>
        <p style="margin:0;font-size:16px;color:#e2d9f3;">${registrant.email}</p>
      </td></tr>
      <tr><td style="padding:0 20px 16px;">
        <p style="margin:0 0 6px;font-size:13px;color:#8b7cc8;text-transform:uppercase;letter-spacing:1px;">Academic Year</p>
        <p style="margin:0;font-size:16px;color:#e2d9f3;">${registrant.academic_year}</p>
      </td></tr>
    </table>

    <p style="margin:0 0 16px;font-size:15px;color:#c4b5fd;">Present this QR code at the door to check in:</p>
    <div style="text-align:center;margin:0 0 28px;">
      <img src="cid:qr-code" width="200" height="200" alt="Check-In QR Code" style="border-radius:8px;border:3px solid #7B73F0;" />
    </div>

    <p style="margin:0;font-size:14px;color:#8b7cc8;">See you at AI Summit! If you have any questions, reply to this email.</p>
  `;

  const qrBase64 = qrDataUri.replace(/^data:image\/png;base64,/, "");
  const qrBuffer = Buffer.from(qrBase64, "base64");

  console.log("[email] sendApprovalEmail → to:", registrant.email, "from:", FROM);
  console.log("[email] Resend API key present?", !!process.env.RESEND_API_KEY);
  try {
    const result = await resend.emails.send({
      from: FROM,
      to: registrant.email,
      subject: "You're registered for AI Summit!",
      html: baseHtml(body),
      attachments: [
        {
          filename: "qr-code.png",
          content: qrBuffer,
          contentType: "image/png",
          contentId: "qr-code",
        },
      ],
    });
    console.log("[email] sendApprovalEmail Resend response:", JSON.stringify(result));
  } catch (err) {
    console.error("[email] sendApprovalEmail failed:", err);
  }
}

export async function sendReApprovalEmail(
  registrant: RegistrantInfo,
  qrDataUri: string,
): Promise<void> {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#a78bfa;">Registration Approved!</h2>
    <p style="margin:0 0 24px;font-size:16px;color:#c4b5fd;">Hi ${registrant.first_name}, your AI Summit registration has been <strong style="color:#86efac;">approved</strong>. We're excited to see you there!</p>

    <p style="margin:0 0 16px;font-size:15px;color:#c4b5fd;">Present this QR code at the door to check in:</p>
    <div style="text-align:center;margin:0 0 28px;">
      <img src="cid:qr-code" width="200" height="200" alt="Check-In QR Code" style="border-radius:8px;border:3px solid #7B73F0;" />
    </div>

    <p style="margin:0;font-size:14px;color:#8b7cc8;">See you at AI Summit!</p>
  `;

  const qrBase64 = qrDataUri.replace(/^data:image\/png;base64,/, "");
  const qrBuffer = Buffer.from(qrBase64, "base64");

  try {
    await resend.emails.send({
      from: FROM,
      to: registrant.email,
      subject: "Your Registration Has Been Approved!",
      html: baseHtml(body),
      attachments: [
        {
          filename: "qr-code.png",
          content: qrBuffer,
          contentType: "image/png",
          contentId: "qr-code",
        },
      ],
    });
  } catch (err) {
    console.error("[email] sendReApprovalEmail failed:", err);
  }
}

export async function sendWaitlistedEmail(
  registrant: RegistrantInfo,
): Promise<void> {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#a78bfa;">Registration Update</h2>
    <p style="margin:0 0 24px;font-size:16px;color:#c4b5fd;">Hi ${registrant.first_name}, your AI Summit registration has been placed on the <strong style="color:#60a5fa;">waitlist</strong>.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a3e;border-radius:8px;border:1px solid #2d1b69;margin:0 0 28px;">
      <tr><td style="padding:20px;">
        <p style="margin:0;font-size:15px;color:#c4b5fd;">We'll notify you by email if a spot opens up. Thank you for your interest in AI Summit!</p>
      </td></tr>
    </table>

    <p style="margin:0;font-size:14px;color:#8b7cc8;">Questions? Reply to this email and we'll be happy to help.</p>
  `;

  try {
    await resend.emails.send({
      from: FROM,
      to: registrant.email,
      subject: "Registration Update - Waitlisted",
      html: baseHtml(body),
    });
  } catch (err) {
    console.error("[email] sendWaitlistedEmail failed:", err);
  }
}

export async function sendRejectedEmail(
  registrant: RegistrantInfo,
): Promise<void> {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:#a78bfa;">Registration Update</h2>
    <p style="margin:0 0 24px;font-size:16px;color:#c4b5fd;">Hi ${registrant.first_name}, we regret to inform you that your AI Summit registration was not accepted at this time.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a0a3e;border-radius:8px;border:1px solid #2d1b69;margin:0 0 28px;">
      <tr><td style="padding:20px;">
        <p style="margin:0;font-size:15px;color:#c4b5fd;">We appreciate your interest and encourage you to stay connected with the AI Society at ASU for future events and opportunities.</p>
      </td></tr>
    </table>

    <p style="margin:0;font-size:14px;color:#8b7cc8;">Thank you for your understanding.</p>
  `;

  try {
    await resend.emails.send({
      from: FROM,
      to: registrant.email,
      subject: "Registration Update",
      html: baseHtml(body),
    });
  } catch (err) {
    console.error("[email] sendRejectedEmail failed:", err);
  }
}
