import { Formatter } from './../../utils/formatter';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Order, OrderInvoice } from 'generated/prisma';

interface OrderItem {
  category: string;
  images: string[];
  id: string;
  title: string;
  price: number;
  salePrice: number | null;
  size: string;
  sku: string;
  color: string | null;
  quantity: number;
}

export const getOrderInvoiceReport = (
  order: Order & { invoice: OrderInvoice; orderItems: OrderItem[] },
): TDocumentDefinitions => {
  const docDefinition: TDocumentDefinitions = {
    pageMargins: [40, 20, 40, 40],

    content: [
      // ENCABEZADO PRINCIPAL
      {
        columns: [
          // IZQUIERDA
          [
            { text: 'DUNNO', bold: true, fontSize: 16 },
            { text: 'N° Punto de Venta 1' },
            { text: 'C/ Dirección de tu empresa' },
            { text: 'Teléfono: 00000000' },
            { text: 'Tarija', margin: [0, 2, 0, 0] },
          ],

          // DERECHA
          [
            { text: 'NIT: 102070302345', alignment: 'right' },
            {
              text: `Factura N°: ${order.invoice.invoiceNumber}`,
              alignment: 'right',
            },
            { text: 'Cod. Autorización: —', alignment: 'right' },
          ],
        ],
      },

      { text: ' ', margin: [0, 10] },

      // TITULO
      {
        text: 'FACTURA',
        alignment: 'center',
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },

      // DATOS PRINCIPALES
      {
        columns: [
          [
            { text: `Fecha: ${Formatter.dateFormatter(order.createdAt)}` },
            { text: `Nombre/Razón Social: ${order.invoice.socialReason}` },
          ],
          [
            {
              text: `NIT/CI/CEX: ${order.invoice.nitNumber}`,
              alignment: 'right',
            },
            { text: `Cod. Cliente: ${order.id}`, alignment: 'right' },
          ],
        ],
        margin: [0, 0, 0, 15],
      },

      // TABLA DE ITEMS
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', 'auto', 'auto'],
          body: [
            [
              { text: 'CÓDIGO', bold: true },
              { text: 'CANTIDAD', bold: true },
              { text: 'DESCRIPCIÓN', bold: true },
              { text: 'PRECIO', bold: true },
              { text: 'SUBTOTAL', bold: true },
            ],

            ...order.orderItems.map((item) => [
              item.sku,
              item.quantity,
              item.title + (item.size ? ` (Talla: ${item.size})` : ''),
              { text: Formatter.currencyFormatter(item.price) },
              {
                text: Formatter.currencyFormatter(item.quantity * item.price),
                bold: true,
              },
            ]),
          ],
        },
        margin: [0, 0, 0, 0],
      },

      // TOTALES
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            layout: 'noBorders',
            table: {
              body: [
                [
                  { text: 'SUB TOTAL Bs.', bold: true },
                  Formatter.currencyFormatter(order.subTotal),
                ],
                [
                  { text: 'IMPUESTOS (IVA) Bs.', bold: true },
                  Formatter.currencyFormatter(order.totalTax),
                ],
                [
                  { text: 'TOTAL Bs.', bold: true },
                  Formatter.currencyFormatter(order.totalAmount),
                ],
              ],
            },
          },
        ],
      },

      // QR
      {
        alignment: 'right',
        qr: ' ',
        fit: 80,
        margin: [0, 20, 0, 0],
      },

      // LEYENDA
      {
        text: 'Este documento es una representación gráfica de la Factura Digital emitida mediante el sistema DUNNO.',
        fontSize: 9,
        italics: true,
        margin: [0, 20, 0, 0],
      },
    ],
  };

  return docDefinition;
};
