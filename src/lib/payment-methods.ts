import type { PaymentMethod } from "@/lib/supabase/types";

/** Order = the order the options render in the public booking form. */
export const PAYMENT_METHODS = ["efectivo", "transferencia"] as const satisfies readonly PaymentMethod[];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia bancaria",
};
