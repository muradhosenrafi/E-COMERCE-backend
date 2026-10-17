import "dotenv/config";
import nodemailer from "nodemailer";

const logoUrl =
  "https://armane-logo.muradhosenrafi.chatgpt.site/armane-logo.jpg";

let transporter;

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]
  );
}

export function buildOtpEmail({
  email,
  otp,
  username = "",
  otpExpiresAt,
} = {}) {
  const recipient =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  const code = String(otp ?? "");
  const expiry = new Date(otpExpiresAt);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw new Error("A valid recipient email is required.");
  }

  if (!/^\d{6}$/.test(code)) {
    throw new Error(
      "OTP must contain exactly 6 digits. Keep it as a string."
    );
  }

  if (
    !Number.isFinite(expiry.getTime()) ||
    expiry.getTime() <= Date.now()
  ) {
    throw new Error("Pass a valid future otpExpiresAt.");
  }

  const name =
    typeof username === "string" && username.trim()
      ? username.trim().slice(0, 80)
      : "there";

  const expiryTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(expiry);

  const subject = "ARMANE — Your email verification code";

  const text = `Hi ${name},

Your ARMANE verification code is: ${code}

Enter this code in the verification panel.
It expires at ${expiryTime} (Bangladesh time).

Never share this code with anyone.
If you did not create an ARMANE account, you can ignore this email.

ARMANE`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no">
  <title>ARMANE email verification</title>
  <style>
    @media only screen and (max-width: 480px) {
      .outer { padding: 20px 12px !important; }
      .content { padding: 26px 20px !important; }
      .title { font-size: 29px !important; line-height: 36px !important; }
      .code { font-size: 34px !important; letter-spacing: 6px !important; }
      .logo { width: 72px !important; height: 72px !important; }
      .brand { font-size: 19px !important; }
    }
  </style>
</head>

<body style="margin:0;padding:0;background-color:#090b16;color:#edeaf9;font-family:Arial,Helvetica,sans-serif;">

  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    Your ARMANE email verification code is inside.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#090b16">
    <tr>
      <td align="center" class="outer" style="padding:44px 20px;">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
          style="max-width:560px;background-color:#11101f;border:1px solid #352546;border-radius:24px;overflow:hidden;">

          <tr>
            <td height="3" bgcolor="#9a73ef" style="height:3px;line-height:3px;font-size:0;">
              &nbsp;
            </td>
          </tr>

          <tr>
            <td class="content" style="padding:32px 34px 28px;background-color:#171225;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="96" valign="middle">
                    <img
                      class="logo"
                      src="${logoUrl}"
                      width="80"
                      height="80"
                      alt="ARMANE logo"
                      style="display:block;width:80px;height:80px;border:0;border-radius:14px;background-color:#ffffff;"
                    >
                  </td>

                  <td valign="middle">
                    <p class="brand" style="margin:0;font-size:21px;line-height:30px;font-weight:bold;letter-spacing:3px;color:#ffffff;">
                      ARMANE<span style="color:#b899f5;">.</span>
                    </p>
                    <p style="margin:5px 0 0;font-size:10px;line-height:17px;letter-spacing:1.8px;color:#aa99bd;">
                      YOUR NEXT CHAPTER
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding:34px;">

              <p style="margin:0 0 12px;font-size:10px;line-height:17px;font-weight:bold;letter-spacing:2.5px;color:#bca5ef;">
                ONE LAST STEP
              </p>

              <h1 class="title" style="margin:0;font-size:34px;line-height:43px;letter-spacing:-1px;color:#ffffff;">
                Verify your email<span style="color:#a78bfa;">.</span>
              </h1>

              <p style="margin:24px 0 8px;font-size:14px;line-height:23px;color:#e5dff0;">
                Hi ${escapeHtml(name)},
              </p>

              <p style="margin:0 0 25px;font-size:14px;line-height:24px;color:#a5a0b8;">
                A fresh start is one code away. Enter the code below in your
                ARMANE verification panel to finish creating your account.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background-color:#1c152d;border:1px solid #644588;border-radius:17px;">
                <tr>
                  <td align="center" style="padding:23px 12px 21px;">

                    <p style="margin:0 0 13px;font-size:10px;line-height:16px;font-weight:bold;letter-spacing:2px;color:#bcadd8;">
                      YOUR VERIFICATION CODE
                    </p>

                    <code class="code" dir="ltr"
                      style="display:block;font-family:Consolas,'Courier New',monospace;font-size:38px;line-height:54px;font-weight:bold;letter-spacing:6px;color:#f1e8ff;white-space:nowrap;user-select:all;-webkit-user-select:all;">${code}</code>

                    <p style="margin:12px 0 0;font-size:11px;line-height:18px;color:#aca1bd;">
                      Double-click or long-press to select and copy.
                    </p>

                  </td>
                </tr>
              </table>

              <p style="margin:17px 0 0;text-align:center;font-size:12px;line-height:21px;color:#c4b5df;">
                Expires at
                <strong style="color:#dfcaff;">${expiryTime}</strong>
                <br>
                <span style="font-size:10px;color:#8c839f;">
                  Bangladesh time &middot; use the code before it expires
                </span>
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="margin-top:27px;border-top:1px solid #2a2337;">
                <tr>
                  <td style="padding-top:21px;">
                    <p style="margin:0 0 7px;font-size:12px;line-height:20px;font-weight:bold;color:#d1c7df;">
                      Keep your account yours.
                    </p>
                    <p style="margin:0;font-size:12px;line-height:21px;color:#8d859f;">
                      Never share this code with anyone. If you didn&rsquo;t
                      create an ARMANE account, you can ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <p style="margin:21px 0 0;font-size:10px;line-height:18px;letter-spacing:1.2px;color:#71677e;">
          ARMANE &middot; A LITTLE SIMPLER. A LOT SMARTER.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    to: recipient,
    subject,
    text,
    html,
  };
}

const emailSender = async (options) => {
  const user = (process.env.GMAIL_USER || "").trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s/g, "");

  if (!user || !pass) {
    throw new Error(
      "Set GMAIL_USER and GMAIL_APP_PASSWORD in your backend .env file."
    );
  }

  const message = buildOtpEmail(options);

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  return transporter.sendMail({
    from: {
      name: "ARMANE",
      address: user,
    },
    ...message,
  });
};

export default emailSender;