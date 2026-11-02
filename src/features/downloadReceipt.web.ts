import type { Charge } from "../state";
import { createReceiptPdf } from "./receiptPdf";

export async function downloadReceipt(charge: Charge) {
  const bytes = await createReceiptPdf(charge);
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `onze-mobi-extrato-${charge.id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
