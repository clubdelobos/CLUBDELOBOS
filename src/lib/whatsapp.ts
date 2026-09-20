import { PAYMENT_METHOD_LABEL } from "@/lib/payment-methods";
import type { PaymentMethod } from "@/lib/supabase/types";

export interface WhatsAppBankAccount {
  bank: string;
  account_type: string;
  account_number: string;
  holder: string;
}

export interface WhatsAppBookingInput {
  customerName: string;
  tourTitle: string;
  /** ISO date, "YYYY-MM-DD". */
  requestedDate: string;
  numPeople: number;
  paymentMethod: PaymentMethod | null;
}

/** "Buenos días / tardes / noches" for the current hour in El Salvador. */
export function salvadoranGreeting(now: Date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/El_Salvador" }).format(now),
  ) % 24;
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("es-SV", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function accountLines(account: WhatsAppBankAccount): string[] {
  const head = [account.bank, account.account_type].filter(Boolean).join(" · ");
  return [`🏦 *${head}*`, `Cuenta: ${account.account_number}`, ...(account.holder ? [`A nombre de: ${account.holder}`] : [])];
}

/** The ready-to-send WhatsApp text for one booking (WhatsApp *bold* markup). */
export function buildWhatsAppMessage(
  booking: WhatsAppBookingInput,
  accounts: WhatsAppBankAccount[],
  now: Date = new Date(),
): string {
  const firstName = booking.customerName.trim().split(/\s+/)[0] ?? "";
  const people = `${booking.numPeople} ${booking.numPeople === 1 ? "persona" : "personas"}`;
  const lines = [
    `${salvadoranGreeting(now)}${firstName ? ` ${firstName}` : ""}, ¡gracias por contactarte con Club de Lobos! 🐺`,
    "",
    "Recibimos tu solicitud de reserva:",
    `• Salida: *${booking.tourTitle}*`,
    `• Fecha: ${longDate(booking.requestedDate)}`,
    `• Personas: ${people}`,
  ];

  if (booking.paymentMethod) lines.push(`• Método de pago: ${PAYMENT_METHOD_LABEL[booking.paymentMethod]}`);

  if (booking.paymentMethod === "transferencia") {
    lines.push("");
    if (accounts.length > 0) {
      lines.push("Para confirmar tu lugar, puedes hacer la transferencia a cualquiera de estas cuentas:", "");
      accounts.forEach((account, index) => {
        if (index > 0) lines.push("");
        lines.push(...accountLines(account));
      });
      lines.push("", "Cuando la hagas, envíanos por aquí el comprobante y te confirmamos tu reserva.");
    } else {
      lines.push("Te compartiremos los datos de la cuenta para la transferencia en un momento.");
    }
  } else if (booking.paymentMethod === "efectivo") {
    lines.push("", "Coordinaremos contigo el momento y el punto para el pago en efectivo.");
  }

  lines.push("", "Quedamos atentos a cualquier duda. ¡Nos vemos en la aventura!");
  return lines.join("\n");
}

/**
 * `https://wa.me/<digits>?text=…`. The stored phone is "+503 XXXXXXXX"; wa.me
 * wants the digits only. Returns null when there's no usable number.
 */
export function buildWhatsAppUrl(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
