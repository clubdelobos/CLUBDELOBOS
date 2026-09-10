import "server-only";

/**
 * Minimal transactional-email sender over the Resend REST API.
 *
 * No SDK on purpose — one `fetch` keeps the dependency list lean and matches
 * the rest of this codebase. Provision Resend from the Vercel Marketplace
 * (`vercel integration add resend`), which sets `RESEND_API_KEY`; set
 * `EMAIL_FROM` to a verified sender on the site's domain, e.g.
 * `Club de Lobos <reservas@tu-dominio>`.
 *
 * Degrades gracefully: returns `{ ok: false }` (never throws) when it isn't
 * configured, so callers can treat email as best-effort.
 */

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Optional Reply-To — e.g. the customer's own address. */
  replyTo?: string;
}

export async function sendEmail(mail: OutgoingEmail): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return { ok: false, error: "email-not-configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { ok: false, error: `resend ${response.status} ${detail}`.trim() };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "send failed" };
  }
}
