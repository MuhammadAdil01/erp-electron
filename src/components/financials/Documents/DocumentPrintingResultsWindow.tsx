import React, { useMemo, useState } from 'react';
import { Eye, Mail, Printer, RefreshCw } from 'lucide-react';
import {
  documentPrintingApi,
  type DocumentPrintingCriteria,
  type DocumentPrintingLookups,
  type PrintListRow,
} from '../../../api/financials.api';
import { ClassicWindow, StatusNote, ToolBtn, type WindowState } from '../../ui/ClassicWindow';
import { GreyBtn, YellowBtn, cn } from '../../ui/ClassicERPUI';
import { fmtDate, fmtMoney, printHtml, renderDocuments } from './documentPrintingOutput';

interface Props {
  criteria: DocumentPrintingCriteria;
  typeLabel: string;
  initialRows: PrintListRow[];
  truncated: boolean;
  lookups: DocumentPrintingLookups;
  copies: number;
  useLayoutSettings: boolean;
  windowState: WindowState;
  onUpdateState: (patch: Partial<WindowState>) => void;
  onFocus: () => void;
  onClose: () => void;
}

const errText = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

/**
 * Document Printing — the list SAP shows after OK on the Selection Criteria.
 * Every matching document starts ticked. Print Preview shows the job without
 * recording anything; Print sends it to the printer and then asks whether it
 * came out, and only a Yes sets the Printed flag. E-Mail sends each document
 * to its business partner and flags the ones that went.
 */
export const DocumentPrintingResultsWindow: React.FC<Props> = ({
  criteria, typeLabel, initialRows, truncated: initialTruncated, lookups, copies,
  useLayoutSettings, windowState, onUpdateState, onFocus, onClose,
}) => {
  const [rows, setRows] = useState(initialRows);
  const [truncated, setTruncated] = useState(initialTruncated);
  const [ticked, setTicked] = useState<Set<string>>(() => new Set(initialRows.map((r) => r.id)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null);
  const [emailAsk, setEmailAsk] = useState(false);
  const [preview, setPreview] = useState<{ html: string; ids: string[] } | null>(null);
  const [previewState, setPreviewState] = useState<WindowState>(() => ({
    x: windowState.x + 40, y: Math.max(0, windowState.y - 60), width: 860, height: 640,
    isMinimized: false, isMaximized: false, zIndex: windowState.zIndex + 1,
  }));

  const selectedIds = useMemo(() => rows.filter((r) => ticked.has(r.id)).map((r) => r.id), [rows, ticked]);
  const allTicked = rows.length > 0 && selectedIds.length === rows.length;

  const toggle = (id: string) =>
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const say = (s: string) => { setError(''); setStatus(s); };
  const fail = (e: unknown, fallback: string) => { setStatus(''); setError(errText(e, fallback)); };

  const refresh = async () => {
    setBusy(true);
    try {
      const res = await documentPrintingApi.search(criteria);
      setRows(res.rows);
      setTruncated(res.truncated);
      // Keep what is still listed ticked; documents now filtered out drop away.
      setTicked((prev) => new Set(res.rows.filter((r) => prev.has(r.id)).map((r) => r.id)));
    } catch (e) {
      fail(e, 'Could not refresh the list');
    } finally {
      setBusy(false);
    }
  };

  const render = async (ids: string[], forEmail = false) => {
    const docs = await documentPrintingApi.documents(criteria.documentType, ids);
    const opts = {
      companyName: lookups.companyName,
      copies: forEmail ? 1 : copies,
      preferences: lookups.printPreferences,
      useLayoutSettings,
    };
    return { docs, html: renderDocuments(docs, opts), opts };
  };

  const needSelection = () => {
    if (selectedIds.length) return false;
    fail(null, 'Select at least one document');
    return true;
  };

  const onPreview = async () => {
    if (needSelection()) return;
    setBusy(true);
    try {
      const { html } = await render(selectedIds);
      setPreview({ html, ids: selectedIds });
      setPreviewState((p) => ({ ...p, isMinimized: false, zIndex: windowState.zIndex + 1 }));
      say('');
    } catch (e) {
      fail(e, 'Could not load the documents');
    } finally {
      setBusy(false);
    }
  };

  const doPrint = async (ids: string[], html?: string) => {
    setBusy(true);
    try {
      const job = html ?? (await render(ids)).html;
      await printHtml(job);
      setConfirmIds(ids);
    } catch (e) {
      fail(e, 'Could not print');
    } finally {
      setBusy(false);
    }
  };

  const onPrint = () => {
    if (needSelection()) return;
    void doPrint(selectedIds);
  };

  const onConfirmPrinted = async (ok: boolean) => {
    const ids = confirmIds ?? [];
    setConfirmIds(null);
    if (!ok) {
      say('Not marked as printed — the documents stay in the "still to be printed" list');
      return;
    }
    setBusy(true);
    try {
      const res = await documentPrintingApi.mark(criteria.documentType, ids, 'print');
      say(`${res.marked} document(s) marked as printed`);
      await refresh();
    } catch (e) {
      fail(e, 'Could not mark the documents as printed');
    } finally {
      setBusy(false);
    }
  };

  const onEmail = async () => {
    setEmailAsk(false);
    setBusy(true);
    try {
      const { docs } = await render(selectedIds, true);
      const one = (id: string) =>
        renderDocuments(docs.filter((d) => d.id === id), {
          companyName: lookups.companyName, copies: 1, preferences: lookups.printPreferences, useLayoutSettings,
        });
      const res = await documentPrintingApi.email(
        criteria.documentType,
        docs.map((d) => ({ id: d.id, html: one(d.id) })),
      );
      const failures = res.results.filter((r) => !r.ok);
      if (failures.length) {
        setStatus('');
        setError(
          `${res.sent} sent, ${res.failed} failed — ` +
            failures.slice(0, 3).map((f) => `${f.number ?? f.id}: ${f.error}`).join('; ') +
            (failures.length > 3 ? '…' : ''),
        );
      } else {
        say(`${res.sent} document(s) e-mailed`);
      }
      await refresh();
    } catch (e) {
      fail(e, 'Could not send the e-mails');
    } finally {
      setBusy(false);
    }
  };

  const withBp = rows.filter((r) => ticked.has(r.id) && r.bpCode).length;

  return (
    <>
      <ClassicWindow
        title={`Document Printing — ${typeLabel}`}
        icon={<Printer className="w-3.5 h-3.5 text-gray-600" />}
        windowState={windowState}
        onUpdateState={onUpdateState}
        onFocus={onFocus}
        onClose={onClose}
        minWidth={640}
        minHeight={380}
        toolbar={
          <>
            <ToolBtn onClick={() => setTicked(new Set(rows.map((r) => r.id)))} disabled={busy || allTicked}>
              Select All
            </ToolBtn>
            <ToolBtn onClick={() => setTicked(new Set())} disabled={busy || selectedIds.length === 0}>
              Clear Selection
            </ToolBtn>
            <ToolBtn onClick={() => void refresh()} title="Refresh" disabled={busy}>
              <RefreshCw className={cn('w-3 h-3', busy && 'animate-spin')} />
            </ToolBtn>
            <StatusNote error={error} status={status} />
          </>
        }
        footer={
          <>
            <span>
              {selectedIds.length} of {rows.length} selected
              {truncated && ' · only the first 1,000 matches are listed — narrow the selection criteria'}
            </span>
            <span>Layout: {typeLabel} (system default) · Copies: {copies}</span>
          </>
        }
      >
        <div className="flex-1 min-h-0 overflow-auto bg-white border-b border-[#d4d0c8]">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                <th className="w-6 px-1 border-r border-[#d4d0c8]">
                  <input
                    type="checkbox"
                    checked={allTicked}
                    onChange={() => setTicked(allTicked ? new Set() : new Set(rows.map((r) => r.id)))}
                    className="accent-orange-500"
                  />
                </th>
                {['#', 'Doc. No.', 'Posting Date', 'BP Code', 'BP Name', 'Total', 'Status', 'Printed', 'E-Mailed'].map((h) => (
                  <th key={h} className={cn('py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444] whitespace-nowrap', h === 'Total' ? 'text-right' : 'text-left')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-3 text-gray-400">No matching records found</td>
                </tr>
              )}
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => toggle(r.id)}
                  className={cn(
                    'border-b border-[#f0f0f0] h-[19px] cursor-default',
                    ticked.has(r.id) ? 'bg-[#fff6d5]' : i % 2 ? 'bg-[#fafafa]' : 'bg-white',
                  )}
                >
                  <td className="px-1 text-center border-r border-[#f0f0f0]">
                    <input
                      type="checkbox"
                      checked={ticked.has(r.id)}
                      onChange={() => toggle(r.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="accent-orange-500"
                    />
                  </td>
                  <td className="px-2 text-gray-500">{i + 1}</td>
                  <td className="px-2 font-medium">{r.number}</td>
                  <td className="px-2">{fmtDate(r.postingDate)}</td>
                  <td className="px-2">{r.bpCode ?? ''}</td>
                  <td className="px-2 truncate max-w-[180px]" title={r.bpName ?? ''}>{r.bpName ?? ''}</td>
                  <td className="px-2 text-right whitespace-nowrap">{r.currency} {fmtMoney(r.total)}</td>
                  <td className={cn('px-2', r.isCancelled && 'text-red-700')}>{r.isCancelled ? 'Cancelled' : r.status}</td>
                  <td className="px-2" title={r.lastPrintedAt ? `Last printed ${fmtDate(r.lastPrintedAt)}` : ''}>
                    {r.printed ? `Y (${r.printCount})` : 'N'}
                  </td>
                  <td className="px-2" title={r.lastEmailedAt ? `Last e-mailed ${fmtDate(r.lastEmailedAt)}` : ''}>
                    {r.emailed ? `Y (${r.emailCount})` : 'N'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#f0f0f0] shrink-0">
          <YellowBtn onClick={onPrint} disabled={busy || !selectedIds.length} className="flex items-center gap-1 disabled:opacity-50">
            <Printer className="w-3 h-3" /> Print
          </YellowBtn>
          <GreyBtn onClick={() => void onPreview()} disabled={busy || !selectedIds.length} className="flex items-center gap-1 disabled:opacity-50">
            <Eye className="w-3 h-3" /> Print Preview
          </GreyBtn>
          <GreyBtn
            onClick={() => { if (!needSelection()) setEmailAsk(true); }}
            disabled={busy || !selectedIds.length || !lookups.emailConfigured}
            title={lookups.emailConfigured ? 'E-mail each document to its business partner' : 'E-mail is not configured on the server'}
            className="flex items-center gap-1 disabled:opacity-50"
          >
            <Mail className="w-3 h-3" /> E-Mail
          </GreyBtn>
          <div className="flex-1" />
          <GreyBtn onClick={onClose}>Close</GreyBtn>
        </div>

        {(confirmIds || emailAsk) && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-[80]" onMouseDown={(e) => e.stopPropagation()}>
            <div className="bg-[#ececec] border border-[#404040]/60 shadow-lg w-[340px]">
              <div className="h-[22px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border-b border-gray-400 px-2 flex items-center text-[11px] font-medium">
                {confirmIds ? 'Document Printing' : 'E-Mail Documents'}
              </div>
              <div className="p-3 text-[11px] text-[#333]">
                {confirmIds
                  ? `Were all ${confirmIds.length} document(s) printed successfully?`
                  : `E-mail ${selectedIds.length} document(s) to their business partners' e-mail addresses?` +
                    (withBp < selectedIds.length ? ' Documents without a business partner will be skipped.' : '')}
              </div>
              <div className="flex gap-2 px-3 pb-3">
                {confirmIds ? (
                  <>
                    <YellowBtn onClick={() => void onConfirmPrinted(true)}>Yes</YellowBtn>
                    <GreyBtn onClick={() => void onConfirmPrinted(false)}>No</GreyBtn>
                  </>
                ) : (
                  <>
                    <YellowBtn onClick={() => void onEmail()}>Send</YellowBtn>
                    <GreyBtn onClick={() => setEmailAsk(false)}>Cancel</GreyBtn>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </ClassicWindow>

      {preview && (
        <ClassicWindow
          title={`Print Preview — ${typeLabel} (${preview.ids.length})`}
          icon={<Eye className="w-3.5 h-3.5 text-gray-600" />}
          windowState={previewState}
          setWindowState={setPreviewState}
          onFocus={() => setPreviewState((p) => ({ ...p, zIndex: windowState.zIndex + 1 }))}
          onClose={() => setPreview(null)}
          minWidth={500}
          minHeight={400}
          toolbar={
            <>
              <ToolBtn
                onClick={() => {
                  const job = preview;
                  setPreview(null);
                  void doPrint(job.ids, job.html);
                }}
                disabled={busy}
              >
                <Printer className="w-3 h-3" /> Print
              </ToolBtn>
              <span className="text-[10px] text-gray-500 ml-2">Previewing does not mark documents as printed.</span>
            </>
          }
        >
          <iframe title="Print preview" srcDoc={preview.html} sandbox="" className="flex-1 w-full border-0 bg-[#8a8a8a]" />
        </ClassicWindow>
      )}
    </>
  );
};
