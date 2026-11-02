import type { Charge } from "../state";
import { money, decimal } from "../state";

export function receiptRows(charge: Charge) {
  return [
    ["Identificação", `ONZE-${charge.id}`],
    ["Início", new Date(charge.date).toLocaleString("pt-BR")],
    [
      "Conclusão",
      charge.completedAt
        ? new Date(charge.completedAt).toLocaleString("pt-BR")
        : "Não registrada",
    ],
    ["Eletroposto", charge.station],
    ["Carregador", charge.chargerId ?? "Não registrado"],
    [
      "Veículo",
      charge.vehicle
        ? `${charge.vehicle.brand} ${charge.vehicle.model}`
        : "Não registrado",
    ],
    ["Placa", charge.vehicle?.plate || "Não informada"],
    [
      "Conector / potência",
      `${charge.connector ?? "Não registrado"} / ${decimal(charge.powerKw ?? 0)} kW`,
    ],
    [
      "Bateria",
      `${charge.initialBattery ?? "--"}% para ${charge.targetBattery ?? "--"}%`,
    ],
    ["Energia adicionada", `${decimal(charge.energy)} kWh`],
    ["Duração simulada", `${charge.minutes} min`],
    [
      "Tarifa",
      `${money(charge.pricePerKwh ?? (charge.energy ? charge.cost / charge.energy : 0))}/kWh`,
    ],
    [
      "Pagamento",
      charge.paymentLast4
        ? `Cartão de exemplo final ${charge.paymentLast4}`
        : "Pagamento demonstrativo",
    ],
  ];
}

export async function createReceiptPdf(charge: Charge) {
  // The CommonJS entry also works with Metro's deferred loading of tslib.
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib/cjs");
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Extrato ONZE mobi - ${charge.id}`);
  pdf.setAuthor("ONZE mobi");
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.04, 0.1, 0.18),
    muted = rgb(0.36, 0.43, 0.51),
    cyan = rgb(0, 0.65, 0.73);
  // User text may contain emoji or non-Latin characters unsupported by Helvetica.
  const safe = (text: string) =>
    [...text.replace(/[\n\r\t]/g, " ")]
      .map((c) => {
        try {
          regular.encodeText(c);
          return c;
        } catch {
          return "?";
        }
      })
      .join("");
  const text = (
    value: string,
    x: number,
    y: number,
    size = 11,
    strong = false,
    color = navy,
    maxWidth = 340,
  ) => {
    const font = strong ? bold : regular;
    let display = safe(value);
    while (
      font.widthOfTextAtSize(display, size) > maxWidth &&
      display.length > 3
    )
      display = display.slice(0, -4) + "...";
    page.drawText(display, { x, y, size, font, color });
  };
  page.drawRectangle({ x: 0, y: 698, width: 596, height: 144, color: navy });
  text("ONZE mobi", 40, 790, 25, true, rgb(0.1, 0.91, 0.77));
  text("Extrato da recarga", 40, 750, 20, true, rgb(1, 1, 1));
  text(
    "DEMONSTRAÇÃO - SEM COBRANÇA REAL",
    40,
    721,
    9,
    false,
    rgb(0.71, 0.82, 0.89),
  );
  let y = 665;
  for (const [label, value] of receiptRows(charge)) {
    text(label, 40, y, 10, false, muted, 150);
    text(value, 210, y, 11, true);
    page.drawLine({
      start: { x: 40, y: y - 12 },
      end: { x: 555, y: y - 12 },
      thickness: 0.5,
      color: rgb(0.88, 0.92, 0.95),
    });
    y -= 32;
  }
  page.drawRectangle({
    x: 40,
    y: y - 61,
    width: 515,
    height: 70,
    color: rgb(0.93, 0.97, 0.99),
  });
  text("VALOR TOTAL DEMONSTRATIVO", 56, y - 12, 10, true, muted);
  text(money(charge.cost), 56, y - 43, 25, true, cyan);
  text(
    "Este extrato registra uma sessão simulada do aplicativo ONZE mobi.",
    40,
    104,
    10,
    false,
    muted,
    515,
  );
  text(
    "Não é nota fiscal, comprovante de pagamento ou leitura de um carregador real.",
    40,
    87,
    10,
    false,
    muted,
    515,
  );
  text("ONZE mobi", 40, 38, 9, true, muted);
  text("1 / 1", 525, 38, 9, false, muted, 40);
  return pdf.save();
}
