import type { PrintableDocument } from '../../../api/financials.api';

/**
 * Turns Document Printing's documents into one printable HTML page and sends
 * it to the system print dialog. Kept apart from the windows so preview,
 * print and e-mail all lay a document out the same way.
 */

export interface RenderOptions {
  companyName: string;
  copies: number;
  /** Company Print Preferences (Administration → Print Preferences). */
  preferences: Record<string, unknown>;
  /**
   * "Obtain printer settings from default printing layout": page margins come
   * from Print Preferences instead of the printer's defaults.
   */
  useLayoutSettings: boolean;
}

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** DD.MM.YYYY, the way SAP prints dates. */
export const fmtDate = (iso?: string | null) => {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
};

export const fmtMoney = (v: string | number) => {
  const n = Number(v);
  return Number.isFinite(n)
    ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(v);
};

/** Numeric columns are right-aligned; every other column reads left to right. */
const NUMERIC = new Set(['Quantity', 'Unit Price', 'Tax %', 'Tax', 'Total', 'Debit', 'Credit', 'Invoice Total', 'Amount Paid', 'Annual Debit', 'Annual Credit']);

const prefNumber = (prefs: Record<string, unknown>, key: string, fallback: number) => {
  const n = Number(prefs[key]);
  return Number.isFinite(n) ? n : fallback;
};

function renderOne(doc: PrintableDocument, opts: RenderOptions, copyNo: number): string {
  const showCancelled = doc.isCancelled && opts.preferences.printCancelledWatermark !== false;
  const showDraft = doc.isDraft && opts.preferences.printDraftWatermark !== false;
  const watermark = showCancelled ? 'CANCELLED' : showDraft ? 'DRAFT' : '';
  // SAP marks every output after the first as a copy.
  const isCopy = doc.printCount > 0 || copyNo > 1;

  const partner = doc.partner
    ? `<div class="partner">
         <div class="label">${doc.documentType.startsWith('ap') || doc.documentType === 'outgoing_payment' ? 'Vendor' : 'Customer'}</div>
         <div class="strong">${esc(doc.partner.name)}</div>
         <div>${esc(doc.partner.code)}</div>
         ${doc.partner.address ? `<div>${esc(doc.partner.address)}</div>` : ''}
         ${doc.partner.taxId ? `<div>Tax ID: ${esc(doc.partner.taxId)}</div>` : ''}
         ${doc.partner.phone ? `<div>Tel: ${esc(doc.partner.phone)}</div>` : ''}
         ${doc.partner.email ? `<div>${esc(doc.partner.email)}</div>` : ''}
       </div>`
    : '<div class="partner"></div>';

  const meta: [string, string][] = [
    ['No.', doc.number],
    ['Posting Date', fmtDate(doc.postingDate)],
  ];
  if (doc.dueDate) meta.push(['Due Date', fmtDate(doc.dueDate)]);
  if (doc.reference) meta.push(['Reference', doc.reference]);
  meta.push(['Currency', doc.currency]);

  const head = doc.columns
    .map((c) => `<th class="${NUMERIC.has(c) ? 'num' : ''}">${esc(c)}</th>`)
    .join('');
  const body = doc.lines.length
    ? doc.lines
        .map(
          (line) =>
            `<tr>${line
              .map((cell, i) => {
                const numeric = NUMERIC.has(doc.columns[i]);
                return `<td class="${numeric ? 'num' : ''}">${esc(numeric && cell ? fmtMoney(cell) : cell)}</td>`;
              })
              .join('')}</tr>`,
        )
        .join('')
    : `<tr><td colspan="${doc.columns.length}" class="empty">No lines</td></tr>`;

  const totals = doc.totals
    .map((t, i) => `<tr class="${i === doc.totals.length - 1 ? 'grand' : ''}"><td>${esc(t.label)}</td><td class="num">${esc(doc.currency)} ${esc(fmtMoney(t.value))}</td></tr>`)
    .join('');

  return `
  <section class="doc">
    ${watermark ? `<div class="watermark">${watermark}</div>` : ''}
    <header>
      <div>
        <div class="company">${esc(opts.companyName)}</div>
      </div>
      <div class="title">
        <div class="doc-title">${esc(doc.title)}</div>
        ${isCopy ? '<div class="copy">COPY</div>' : ''}
      </div>
    </header>
    <div class="top">
      ${partner}
      <table class="meta">${meta.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
    </div>
    <table class="lines"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
    <table class="totals">${totals}</table>
    ${doc.remarks ? `<div class="remarks"><span class="label">Remarks</span> ${esc(doc.remarks)}</div>` : ''}
    <footer>Printed ${esc(fmtDate(new Date().toISOString()))} · ${esc(doc.title)} ${esc(doc.number)}</footer>
  </section>`;
}

/** The whole print job: every document, each repeated for the number of copies. */
export function renderDocuments(docs: PrintableDocument[], opts: RenderOptions): string {
  const top = prefNumber(opts.preferences, 'topMarginCm', 0);
  const bottom = prefNumber(opts.preferences, 'bottomMarginCm', 0);
  // With layout settings the Print Preferences margins apply (SAP adds them on
  // top of a 1 cm printable edge); without, the printer's own defaults do.
  const page = opts.useLayoutSettings
    ? `@page { size: A4; margin: ${1 + top}cm 1.2cm ${1 + bottom}cm 1.2cm; }`
    : '@page { size: A4; }';

  const sections: string[] = [];
  for (const doc of docs) {
    for (let copy = 1; copy <= Math.max(1, opts.copies); copy++) sections.push(renderOne(doc, opts, copy));
  }

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(docs.length === 1 ? `${docs[0].title} ${docs[0].number}` : 'Document Printing')}</title>
<style>
  ${page}
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #222; margin: 0; background: #fff; }
  .doc { position: relative; padding: 8px 4px 24px; page-break-after: always; break-after: page; }
  .doc:last-child { page-break-after: auto; break-after: auto; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f39c12; padding-bottom: 8px; margin-bottom: 12px; }
  .company { font-size: 16px; font-weight: bold; }
  .title { text-align: right; }
  .doc-title { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: .5px; }
  .copy { display: inline-block; margin-top: 4px; border: 1px solid #999; padding: 1px 6px; font-size: 10px; color: #666; }
  .top { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 14px; }
  .partner div { line-height: 1.45; }
  .label { font-size: 9px; text-transform: uppercase; color: #777; letter-spacing: .4px; }
  .strong { font-weight: bold; font-size: 12px; }
  table { border-collapse: collapse; }
  .meta td { padding: 1px 0 1px 12px; }
  .meta td:first-child { color: #666; }
  .lines { width: 100%; margin-bottom: 10px; }
  .lines th { background: #f0f0f0; border-bottom: 1px solid #999; text-align: left; padding: 4px 6px; font-size: 10px; }
  .lines td { border-bottom: 1px solid #e3e3e3; padding: 3px 6px; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  .empty { text-align: center; color: #888; padding: 10px; }
  .totals { margin-left: auto; min-width: 260px; }
  .totals td { padding: 2px 6px; }
  .totals tr.grand td { border-top: 1px solid #333; font-weight: bold; }
  .remarks { margin-top: 14px; }
  footer { margin-top: 24px; font-size: 9px; color: #888; border-top: 1px solid #ddd; padding-top: 4px; }
  .watermark { position: absolute; top: 35%; left: 0; right: 0; text-align: center; font-size: 80px; font-weight: bold; color: rgba(200, 0, 0, .12); transform: rotate(-24deg); pointer-events: none; }
  @media screen { body { background: #8a8a8a; padding: 12px; } .doc { background: #fff; max-width: 820px; margin: 0 auto 12px; padding: 28px 32px 36px; box-shadow: 0 1px 4px rgba(0,0,0,.4); } }
</style></head>
<body>${sections.join('')}</body></html>`;
}

/**
 * Opens the system print dialog for a rendered job and resolves once it
 * closes. Whether the pages actually came out is not reported back by the
 * dialog, which is why the window asks the user afterwards.
 */
export function printHtml(html: string): Promise<void> {
  return new Promise((resolve) => {
    // One hidden frame, reused: removing it while a job is still spooling can
    // cancel that job, and there is no reliable signal for "spooled".
    const FRAME_ID = 'document-printing-frame';
    let frame = document.getElementById(FRAME_ID) as HTMLIFrameElement | null;
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = FRAME_ID;
      frame.setAttribute('aria-hidden', 'true');
      Object.assign(frame.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0', visibility: 'hidden' });
      document.body.appendChild(frame);
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      resolve();
    };

    const win = frame.contentWindow;
    const doc = frame.contentDocument;
    if (!win || !doc) {
      finish();
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();
    win.addEventListener('afterprint', finish, { once: true });
    // Give the frame a tick to lay out before printing.
    setTimeout(() => {
      win.focus();
      win.print();
      // print() blocks until the dialog closes; afterprint is the backup.
      finish();
    }, 100);
  });
}
