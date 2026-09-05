import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { utilitiesApi } from '../../../api/administration.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

type Section = 'businessPartners' | 'products' | 'predefinedTexts';

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'businessPartners', label: 'Business Partners' },
  { key: 'products', label: 'Items' },
  { key: 'predefinedTexts', label: 'Predefined Texts' },
];

/**
 * Master Data Cleanup.
 *
 * A report, not a delete button. It lists master records that are inactive and
 * carry no referencing document, which is a good signal but not a proof: a
 * record can still be referenced by something the query did not think to check,
 * and a wizard that deletes on one click is how a company loses a business
 * partner it turns out it needed. Removal stays a deliberate act in the record's
 * own window.
 */
export const MasterDataCleanupWizard: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const companyId = activeCompanyId;

  const [section, setSection] = useState<Section>('businessPartners');
  const [error, setError] = useState('');

  const query = useQuery({
    queryKey: ['master-data-cleanup', companyId],
    queryFn: () => utilitiesApi.masterDataCleanup(),
    enabled: !!companyId,
  });

  const data = query.data;

  const rows = (() => {
    if (!data) return [] as { id: string; primary: string; secondary: string; updatedAt: string }[];
    if (section === 'businessPartners') {
      return data.businessPartners.map((b) => ({
        id: b.id, primary: b.cardCode, secondary: `${b.cardName} (${b.cardType})`, updatedAt: b.updatedAt,
      }));
    }
    if (section === 'products') {
      return data.products.map((p) => ({
        id: p.id, primary: p.sku ?? '—', secondary: p.name, updatedAt: p.updatedAt,
      }));
    }
    return data.predefinedTexts.map((t) => ({
      id: t.id, primary: t.code, secondary: t.name ?? '', updatedAt: t.updatedAt,
    }));
  })();

  return (
    <ClassicWindow
      title="Master Data Cleanup Wizard"
      icon={<Sparkles className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={760}
      minHeight={440}
      toolbar={
        <>
          <ToolBtn onClick={() => { void query.refetch(); setError(''); }} title="Re-scan">
            <RefreshCw className={cn('w-3 h-3', query.isFetching && 'animate-spin')} /> Re-scan
          </ToolBtn>
          <StatusNote
            error={error}
            status={data ? `${data.total} candidate record(s) found.` : ''}
          />
        </>
      }
      footer={
        <>
          <span>{rows.length} row(s) in this section</span>
          <span>Master Data Cleanup</span>
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
          <div className="shrink-0 flex px-2 pt-1.5 bg-[#ececec] border-b border-[#d4d0c8]">
            {SECTIONS.map(({ key, label }) => {
              const active = section === key;
              const count = data
                ? key === 'businessPartners' ? data.businessPartners.length
                  : key === 'products' ? data.products.length
                  : data.predefinedTexts.length
                : 0;
              return (
                <div
                  key={key}
                  onClick={() => setSection(key)}
                  style={{ marginBottom: active ? '-1px' : 0 }}
                  className={cn(
                    'relative px-5 py-1 text-[11px] font-medium cursor-default rounded-t-[3px] border-l border-t border-r',
                    active
                      ? 'bg-white border-[#d4d0c8] text-black z-10'
                      : 'bg-gradient-to-b from-[#f0f0f0] to-[#e0e0e0] border-gray-300 text-gray-600',
                  )}
                >
                  {active && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#ffd700] rounded-t-[3px]" />}
                  {label} ({count})
                </div>
              );
            })}
          </div>

          <div className="flex-1 min-h-0 overflow-auto bg-white custom-scrollbar">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Code</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Description</th>
                  <th className="px-2 py-1 font-bold text-[#444]">Last Changed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-[#f0f0f0]">
                    <td className="px-2 py-1 border-r border-[#f0f0f0] font-mono">{r.primary}</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">{r.secondary}</td>
                    <td className="px-2 py-1">{new Date(r.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {query.isLoading && <div className="p-3 text-[10.5px] text-gray-400">Scanning…</div>}
            {!query.isLoading && !rows.length && (
              <div className="p-3 text-[10.5px] text-gray-400">
                Nothing in this section is both inactive and unreferenced.
              </div>
            )}
          </div>

          {data && (
            <div className="shrink-0 bg-[#fffbe6] border-t border-[#e0d090] px-3 py-2 text-[9.5px] text-gray-700">
              {data.note}
            </div>
          )}
        </>
      )}

      <div className="shrink-0 border-t border-[#d4d0c8] bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
        <YellowBtn onClick={onClose}>OK</YellowBtn>
        <GreyBtn onClick={onClose}>Cancel</GreyBtn>
      </div>
    </ClassicWindow>
  );
};
