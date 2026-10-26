import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Plus, Trash2, Download, Printer, FileText } from 'lucide-react';
import { Button, Input, Select } from '../../components/ui/FormElements';
import { downloadBlob } from '../../utils/file';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export function InvoiceGenerator() {
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-2026-001');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [currency, setCurrency] = useState<string>('$');

  const [fromCompany, setFromCompany] = useState<string>('Zenvio Digital Solutions');
  const [fromEmail, setFromEmail] = useState<string>('billing@zenvio.io');
  const [toCompany, setToCompany] = useState<string>('Acme Global Enterprises');
  const [toEmail, setToEmail] = useState<string>('accounts@acme.com');

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Platform Architecture & Full-Stack Development', quantity: 1, price: 4500 },
    { id: '2', description: 'Cloud Infrastructure & Security Audit', quantity: 1, price: 1800 },
  ]);

  const [taxRate, setTaxRate] = useState<number>(10);
  const [notes, setNotes] = useState<string>('Thank you for your business! Please remit payment within 14 days.');

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substring(7),
        description: 'New Service Item',
        quantity: 1,
        price: 100,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const generatePDF = async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]); // A4
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

    // Header
    page.drawText('INVOICE', { x: 50, y: 780, size: 28, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`# ${invoiceNumber}`, { x: 50, y: 755, size: 14, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });

    // Dates
    page.drawText(`Date: ${issueDate}`, { x: 400, y: 780, size: 10, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(`Due Date: ${dueDate}`, { x: 400, y: 765, size: 10, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

    // Parties
    page.drawText('From:', { x: 50, y: 700, size: 11, font: fontBold });
    page.drawText(fromCompany, { x: 50, y: 685, size: 10, font: fontRegular });
    page.drawText(fromEmail, { x: 50, y: 670, size: 10, font: fontRegular });

    page.drawText('Bill To:', { x: 300, y: 700, size: 11, font: fontBold });
    page.drawText(toCompany, { x: 300, y: 685, size: 10, font: fontRegular });
    page.drawText(toEmail, { x: 300, y: 670, size: 10, font: fontRegular });

    // Table Header
    let y = 610;
    page.drawRectangle({
      x: 50,
      y: y - 5,
      width: 495,
      height: 25,
      color: rgb(0.95, 0.95, 0.95),
    });
    page.drawText('Description', { x: 60, y, size: 10, font: fontBold });
    page.drawText('Qty', { x: 330, y, size: 10, font: fontBold });
    page.drawText('Unit Price', { x: 390, y, size: 10, font: fontBold });
    page.drawText('Total', { x: 480, y, size: 10, font: fontBold });

    // Items
    items.forEach((item) => {
      y -= 30;
      page.drawText(item.description.substring(0, 42), { x: 60, y, size: 9, font: fontRegular });
      page.drawText(String(item.quantity), { x: 330, y, size: 9, font: fontRegular });
      page.drawText(`${currency}${item.price.toFixed(2)}`, { x: 390, y, size: 9, font: fontRegular });
      page.drawText(`${currency}${(item.quantity * item.price).toFixed(2)}`, { x: 480, y, size: 9, font: fontRegular });
    });

    // Summary
    y -= 50;
    page.drawText('Subtotal:', { x: 380, y, size: 10, font: fontRegular });
    page.drawText(`${currency}${subtotal.toFixed(2)}`, { x: 480, y, size: 10, font: fontRegular });

    y -= 20;
    page.drawText(`Tax (${taxRate}%):`, { x: 380, y, size: 10, font: fontRegular });
    page.drawText(`${currency}${taxAmount.toFixed(2)}`, { x: 480, y, size: 10, font: fontRegular });

    y -= 25;
    page.drawText('Grand Total:', { x: 380, y, size: 12, font: fontBold });
    page.drawText(`${currency}${grandTotal.toFixed(2)}`, { x: 480, y, size: 12, font: fontBold });

    // Notes
    if (notes) {
      page.drawText('Notes:', { x: 50, y: 150, size: 10, font: fontBold });
      page.drawText(notes, { x: 50, y: 135, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
    }

    const pdfBytes = await doc.save();
    downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" /> Professional Invoice Generator
        </span>
        <Button variant="primary" size="sm" onClick={generatePDF}>
          <Download className="w-4 h-4 mr-1.5" /> Download Invoice PDF
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Input label="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          <Input label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          <Input label="Issue Date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">From (Your Company)</h4>
            <Input placeholder="Company Name" value={fromCompany} onChange={(e) => setFromCompany(e.target.value)} />
            <Input placeholder="Email Address" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bill To (Client)</h4>
            <Input placeholder="Client Company / Name" value={toCompany} onChange={(e) => setToCompany(e.target.value)} />
            <Input placeholder="Client Email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Line Items</h4>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="col-span-6">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Description"
                    className="w-full bg-transparent text-sm font-medium focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    className="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-100 text-center"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                    className="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-100 text-right"
                  />
                </div>
                <div className="col-span-1 text-right font-semibold text-sm text-slate-800 dark:text-slate-100">
                  {currency}{(item.quantity * item.price).toFixed(2)}
                </div>
                <div className="col-span-1 text-right">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div>
            <Input label="Notes / Payment Terms" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="space-y-2 text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currency}{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">
                Tax Rate:
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-14 px-1 py-0.5 border rounded bg-white dark:bg-slate-800 text-center text-xs"
                />
                %
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currency}{taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-base font-bold text-slate-900 dark:text-white">
              <span>Grand Total:</span>
              <span className="text-purple-600 dark:text-purple-400">
                {currency}{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
