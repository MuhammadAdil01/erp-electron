import React, { useState } from 'react';
import { ListChecks, Search } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
  utilitiesApi,
  numberingApi,
  type NumberingCheckResult,
} from '../../../api/administration.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, ClassicInput, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

/**
 * Check Document Numbering.
 *
 * Reports and never repairs. A gap in a posted document series is a fact about
 * what happened — a number was allocated and the document was never kept — and
 * renumbering posted documents to tidy the report would rewrite history to hide
 * it. The window says what is wrong and leaves the fixing to a human.
 */
export const CheckDocumentNumberingWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const companyId = activeCompanyId;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState<NumberingCheckResult | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const typesQuery = useQuery({
    queryKey: ['numbering-document-types', companyId],
    queryFn: () => numberingApi.documentTypes(),
    enabled: !!companyId,
  });

  const checkMut = useMutation({
    mutationFn: () =>
      utilitiesApi.checkDocumentNumbering({
        documentTypes: selected.size ? [...selected] : undefined,
        from: from || undefined,
        to: to || undefined,
      }),
    onSuccess: (data) => {
      setResult(data);
      setError('');
      setStatus(
        data.isClean
          ? `Checked ${data.checkedDocuments} document(s) — no problems found.`
          : `Checked ${data.checkedDocuments} document(s) — ` +
            `${data.seriesIssues.length} series issue(s), ${data.duplicates.length} duplicate(s), ` +
            `${data.gaps.length} gap(s).`,
      );
    },
    onError: (e: unknown) => {
      setError(e instanceof Error ? e.message : 'The check could not be run.');
      setStatus('');
    },
  });

  const toggle = (t: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });

  const types = typesQuery.data ?? [];

  return (
    <ClassicWindow
      title="Check Document Numbering — Selection Criteria"
      icon={<ListChecks className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={820}
      minHeight={560}
      toolbar={
        <>
          <ToolBtn onClick={() => setSelected(new Set(types.map((t) => t.documentType)))}>
            Select All
          </ToolBtn>
          <ToolBtn onClick={() => setSelected(new Set())}>Clear Selection</ToolBtn>
          <ToolBtn onClick={() => checkMut.mutate()} disabled={checkMut.isPending || !companyId}>
            <Search className="w-3 h-3" /> {checkMut.isPending ? 'Checking…' : 'Run Check'}
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>
            {selected.size ? `${selected.size} document type(s) selected` : 'All document types'}
            {result ? ` · ${result.checkedDocuments} document(s) checked` : ''}
          </span>
          <span>Check Document Numbering</span>
        </>
      }
    >
      {!companyId ? (
        <div className="p-3 text-[10px] text-gray-500 italic">
          No company selected. Open{' '}
          <span className="font-medium not-italic">Administration → Choose Company</span> first.
        </div>
      ) : (
        <>
          <div className="shrink-0 bg-[#f7f7f7] border-b border-[#d4d0c8] p-3">
            <div className="text-[11px] font-bold mb-1.5">Choose Documents to Review</div>
            <div className="grid grid-cols-4 gap-x-4 gap-y-0.5 max-h-[180px] overflow-auto custom-scrollbar">
              {types.map((t) => (
                <label key={t.documentType} className="flex items-center gap-2 text-[10.5px] cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5"
                    checked={selected.has(t.documentType)}
                    onChange={() => toggle(t.documentType)}
                  />
                  <span className="truncate" title={`${t.documentType} (${t.seriesCount} series)`}>
                    {t.documentType}
                  </span>
                </label>
              ))}
              {!types.length && (
                <div className="col-span-4 text-[10.5px] text-gray-400">
                  No numbering series defined yet — set them up under Document Numbering.
                </div>
              )}
            </div>

            <div className="flex items-end gap-4 mt-3">
              <FieldRow label="Date From" labelWidth="80px">
                <ClassicInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" />
              </FieldRow>
              <FieldRow label="To" labelWidth="30px">
                <ClassicInput type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" />
              </FieldRow>
              <span className="text-[9.5px] text-gray-600">
                Leave the dates blank to check every document.
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto bg-white p-3 custom-scrollbar">
            {checkMut.isPending ? (
              <div className="text-[10.5px] text-gray-400">Checking…</div>
            ) : !result ? (
              <div className="text-[10.5px] text-gray-400">
                Pick the document types to review and press Run Check.
              </div>
            ) : result.isClean ? (
              <div className="text-[10.5px] text-green-800">
                No problems found across {result.checkedDocuments} document(s). Every series is
                configured consistently and the numbers run without gaps or duplicates.
              </div>
            ) : (
              <div className="space-y-4">
                {result.seriesIssues.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-red-800 mb-1">
                      Series configuration ({result.seriesIssues.length})
                    </div>
                    <table className="w-full border-collapse text-[10.5px]">
                      <thead>
                        <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                          <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Series</th>
                          <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Document Type</th>
                          <th className="px-2 py-1 font-bold text-[#444]">Problem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.seriesIssues.map((i) => (
                          <tr key={i.seriesId} className="border-b border-[#f0f0f0]">
                            <td className="px-2 py-1 border-r border-[#f0f0f0]">{i.name}</td>
                            <td className="px-2 py-1 border-r border-[#f0f0f0] font-mono">{i.documentType}</td>
                            <td className="px-2 py-1 text-red-800">{i.issue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {result.duplicates.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-red-800 mb-1">
                      Duplicate numbers ({result.duplicates.length})
                    </div>
                    <div className="text-[10.5px] font-mono">
                      {result.duplicates.join(', ')}
                    </div>
                    <div className="text-[9.5px] text-gray-600 mt-1">
                      Two documents share a number. That means a series was reset or edited while it
                      was in use — the fix is to renumber the later document by hand, not to change
                      the series.
                    </div>
                  </div>
                )}

                {result.gaps.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-amber-800 mb-1">
                      Gaps ({result.gaps.length})
                    </div>
                    <table className="w-full border-collapse text-[10.5px] max-w-[420px]">
                      <thead>
                        <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                          <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">After</th>
                          <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Before</th>
                          <th className="px-2 py-1 font-bold text-[#444] text-right">Missing</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.gaps.map((g, i) => (
                          <tr key={i} className="border-b border-[#f0f0f0]">
                            <td className="px-2 py-1 border-r border-[#f0f0f0] font-mono">{g.after}</td>
                            <td className="px-2 py-1 border-r border-[#f0f0f0] font-mono">{g.before}</td>
                            <td className="px-2 py-1 text-right">{g.missing}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="text-[9.5px] text-gray-600 mt-1">
                      A gap usually means a draft was numbered and then deleted. It is reported
                      rather than closed: renumbering posted documents to hide it would rewrite the
                      audit trail.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <div className={cn('shrink-0 border-t border-[#d4d0c8] bg-[#f0f0f0] px-3 py-2 flex items-center gap-2')}>
        <YellowBtn onClick={() => checkMut.mutate()} disabled={checkMut.isPending || !companyId}>
          OK
        </YellowBtn>
        <GreyBtn onClick={onClose}>Cancel</GreyBtn>
      </div>
    </ClassicWindow>
  );
};
