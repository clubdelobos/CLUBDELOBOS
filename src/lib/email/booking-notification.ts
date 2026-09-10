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

/**
 * Builds the "nueva reserva" email sent to the admin notification address
 * (site_settings.booking_notify_email) after a visitor submits the booking
 * form. Purely a heads-up — the full record lives in /admin/bookings.
 */
export function buildBookingNotificationEmail(
  input: BookingNotificationInput,
  recipient: string,
): OutgoingEmail {
  const date = formatDate(input.requestedDate);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const adminUrl = siteUrl ? `${siteUrl}/admin/bookings` : "/admin/bookings";
  const notes = input.notes?.trim();

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

  const html = `<!doctype html>
<html lang="es">
<body style="margin:0;background:#fbfaec;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#373435;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e8e5;">
    <tr>
      <td style="background:#235652;padding:18px 24px;color:#ffffff;font-size:16px;font-weight:bold;">
        Club de Lobos — Nueva reserva
      </td>
    </tr>
    <tr>
      <td style="padding:22px 24px;">
        <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#686c6a;">
          Un cliente envió una solicitud de reserva desde el sitio. Estos son los datos:
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
          ${rows
            .map(
              ([label, value]) => `<tr>
            <td style="padding:6px 0;color:#686c6a;width:130px;vertical-align:top;">${escapeHtml(label)}</td>
            <td style="padding:6px 0;color:#373435;font-weight:bold;">${escapeHtml(value)}</td>
          </tr>`,
            )
            .join("\n          ")}
        </table>
        <p style="margin:22px 0 0;">
          <a href="${adminUrl}" style="display:inline-block;background:#235652;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:bold;">
            Abrir el panel de reservas
          </a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:14px 24px;background:#fbfaec;font-size:11px;color:#9aa09c;">
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
