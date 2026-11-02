import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { Charge } from "../state";
import { createReceiptPdf } from "./receiptPdf";

export async function downloadReceipt(charge: Charge) {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error(
      "O compartilhamento de arquivos não está disponível neste aparelho.",
    );
  const file = new File(Paths.cache, `onze-mobi-extrato-${charge.id}.pdf`);
  file.create({ overwrite: true });
  await file.write(await createReceiptPdf(charge));
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/pdf",
    dialogTitle: "Salvar extrato da recarga",
    UTI: "com.adobe.pdf",
  });
}
