import "server-only";
import type { OutgoingEmail } from "@/lib/email/send";

export interface BookingNotificationInput {
  customerName: string;
  email: string;
  phone: string;
  tourTitle: string;
  /** ISO date, "YYYY-MM-DD". */
  requestedDate: string;
  numPeople: number;
  notes?: string | null;
}

/**
 * Visual identity for the e-mail, taken from `site_settings` so the message
 * follows whichever palette / logo the admin has selected for the site.
 */
export interface EmailBranding {
  /** Absolute URL to a logo that reads on a dark bar (site header logo). */
  logoLightUrl?: string | null;
  /** Absolute URL to a logo that reads on a light bar. */
  logoDarkUrl?: string | null;
  palette1?: string | null;
  palette3?: string | null;
  palette5?: string | null;
  palette8?: string | null;
}

function formatDate(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString("es-SV", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Black or white, whichever contrasts better with `hex`. Falls back to white. */
function readableOn(hex: string | null | undefined): "#111111" | "#ffffff" {
  const match = /^#?([0-9a-fA-F]{6})$/.exec((hex ?? "").trim());
  if (!match) return "#ffffff";
  const int = parseInt(match[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#ffffff";
}

function hex(value: string | null | undefined, fallback: string): string {
  return /^#?[0-9a-fA-F]{6}$/.test((value ?? "").trim()) ? (value as string).trim() : fallback;
}

/**
 * Builds the "nueva reserva" e-mail sent to the team after a visitor submits
 * the booking form. Heads-up only — the full record lives in /admin/bookings.
 */
export function buildBookingNotificationEmail(
  input: BookingNotificationInput,
  recipient: string,
  branding: EmailBranding = {},
): OutgoingEmail {
  const date = formatDate(input.requestedDate);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const adminUrl = siteUrl ? `${siteUrl}/admin/bookings` : "/admin/bookings";
  const notes = input.notes?.trim();

  // Colours follow the site's selected palette.
  const headerBg = hex(branding.palette1, "#235652");
  const bodyBg = hex(branding.palette8, "#fbfaec");
  const textStrong = hex(branding.palette3, "#373435");
  const textMuted = hex(branding.palette5, "#686c6a");
  const onHeader = readableOn(headerBg);
  const logoUrl = onHeader === "#ffffff" ? branding.logoLightUrl : branding.logoDarkUrl;

  const subject = `Nueva reserva — ${input.tourTitle} (${date})`;

  const rows: Array<[string, string]> = [
    ["Salida", input.tourTitle],
    ["Fecha solicitada", date],
    ["Personas", String(input.numPeople)],
    ["Nombre", input.customerName],
    ["Correo", input.email],
    ["Teléfono", input.phone],
  ];
  if (notes) rows.push(["Notas", notes]);

  const text = [
    "Nueva solicitud de reserva desde el sitio.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Confírmala o recházala en el panel: ${adminUrl}`,
  ].join("\n");

  const brandCell = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="Club de Lobos" height="34" style="height:34px;width:auto;display:block;border:0;outline:none;text-decoration:none;">`
    : `<span style="color:${onHeader};font-size:16px;font-weight:bold;letter-spacing:.02em;">Club de Lobos</span>`;

  const html = `<!doctype html>
<html lang="es">
<body style="margin:0;background:${bodyBg};padding:24px;font-family:Arial,Helvetica,sans-serif;color:${textStrong};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid rgba(0,0,0,0.08);">
    <tr>
      <td style="background:${headerBg};padding:16px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;">${brandCell}</td>
            <td style="vertical-align:middle;text-align:right;color:${onHeader};font-size:13px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;opacity:.85;">
              Nueva reserva
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:22px 24px;">
        <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:${textMuted};">
          Un cliente envió una solicitud de reserva desde el sitio. Estos son los datos:
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
          ${rows
            .map(
              ([label, value]) => `<tr>
            <td style="padding:6px 0;color:${textMuted};width:130px;vertical-align:top;">${escapeHtml(label)}</td>
            <td style="padding:6px 0;color:${textStrong};font-weight:bold;">${escapeHtml(value)}</td>
          </tr>`,
            )
            .join("\n          ")}
        </table>
        <p style="margin:22px 0 0;">
          <a href="${adminUrl}" style="display:inline-block;background:${headerBg};color:${onHeader};text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:bold;">
            Abrir el panel de reservas
          </a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:14px 24px;background:${bodyBg};font-size:11px;color:${textMuted};">
        Aviso automático enviado a ${escapeHtml(recipient)}. La solicitud no genera ningún cobro.
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    to: recipient,
    subject,
    html,
    text,
    replyTo: input.email,
  };
}
