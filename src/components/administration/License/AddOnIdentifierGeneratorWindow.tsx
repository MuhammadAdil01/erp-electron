import React, { useState } from 'react';
import { Fingerprint, RefreshCw, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { licenseApi, type AddOnType } from '../../../api/administration.api';
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

const TYPES: { value: AddOnType; label: string }[] = [
  { value: 'DEVELOPMENT', label: 'Development' },
  { value: 'IMPLEMENTATION', label: 'Implementation' },
  { value: 'SOLUTION', label: 'Solution' },
];

/**
 * Add-On Identifier Generator.
 *
 * The identifier is generated server-side from random bytes rather than derived
 * from the add-on's name: something recomputable from public inputs is a label,
 * not an identifier, and two partners shipping an add-on of the same name would
 * collide.
 */
export const AddOnIdentifierGeneratorWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [addOnName, setAddOnName] = useState('');
  const [addOnType, setAddOnType] = useState<AddOnType>('DEVELOPMENT');
  const [partnerNamespace, setPartnerNamespace] = useState('');
  const [latest, setLatest] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const listQuery = useQuery({
    queryKey: ['add-on-identifiers', companyId],
    queryFn: () => licenseApi.listAddOns(),
    enabled: !!companyId,
  });

  const onErr = (e: unknown) => {
    setError(e instanceof Error ? e.message : 'The identifier could not be generated.');
    setStatus('');
  };
  const invalidate = () => void qc.invalidateQueries({ queryKey: ['add-on-identifiers'] });

  const generateMut = useMutation({
    mutationFn: () =>
      licenseApi.generateAddOn({
        addOnName: addOnName.trim(),
        addOnType,
        partnerNamespace: partnerNamespace.trim() || undefined,
      }),
    onSuccess: (row) => {
      invalidate();
      setLatest(row.identifier);
      setError('');
      setStatus(`Identifier generated for ${row.addOnName}.`);
    },
    onError: onErr,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => licenseApi.removeAddOn(id),
    onSuccess: () => {
      invalidate();
      setError('');
      setStatus('Identifier deleted.');
    },
    onError: onErr,
  });

  const isBusy = generateMut.isPending || deleteMut.isPending;

  const handleGenerate = () => {
    if (!addOnName.trim()) { setError('An add-on name is required.'); return; }
    setError('');
    generateMut.mutate();
  };

  return (
    <ClassicWindow
      title="Add-On Identifier Generator"
      icon={<Fingerprint className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={720}
      minHeight={460}
      toolbar={
        <>
          <ToolBtn onClick={() => listQuery.refetch()} title="Refresh">
            <RefreshCw className={cn('w-3 h-3', listQuery.isFetching && 'animate-spin')} /> Refresh
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>{listQuery.data?.length ?? 0} identifier(s) generated</span>
          <span>Add-On Identifier Generator</span>
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
            <div className="text-[11px] font-bold mb-2">Select Add-on Type</div>
            <div className="flex gap-6 mb-3">
              {TYPES.map((t) => (
                <label key={t.value} className="flex items-center gap-2 text-[11px] cursor-pointer">
                  <input
                    type="radio"
                    name="addOnType"
                    className="w-3 h-3"
                    checked={addOnType === t.value}
                    onChange={() => setAddOnType(t.value)}
                  />
                  {t.label}
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-x-6 max-w-[720px]">
              <FieldRow label="Add-On Name" labelWidth="130px" required>
                <ClassicInput
                  value={addOnName}
                  onChange={(e) => setAddOnName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
                  className="w-full"
                  autoFocus
                />
              </FieldRow>
              <FieldRow label="Partner Namespace" labelWidth="130px">
                <ClassicInput
                  value={partnerNamespace}
                  onChange={(e) => setPartnerNamespace(e.target.value)}
                  className="w-full font-mono"
                  placeholder="ACME"
                />
              </FieldRow>
            </div>

            <div className="mt-2">
              <div className="text-[11px] font-bold mb-1">Add-On Identifier</div>
              <div className="border border-gray-400 bg-white p-2 min-h-[46px] font-mono text-[11px] break-all select-all">
                {latest ?? <span className="text-gray-400 font-sans">Press Generate.</span>}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <YellowBtn onClick={handleGenerate} disabled={isBusy}>
                {generateMut.isPending ? 'Generating…' : 'Generate'}
              </YellowBtn>
              <GreyBtn onClick={onClose}>Cancel</GreyBtn>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-auto bg-white custom-scrollbar">
            <table className="w-full border-collapse text-[10.5px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Add-On</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Type</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Identifier</th>
                  <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Generated</th>
                  <th className="px-2 py-1 font-bold text-[#444]" />
                </tr>
              </thead>
              <tbody>
                {(listQuery.data ?? []).map((a) => (
                  <tr key={a.id} className="border-b border-[#f0f0f0]">
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">{a.addOnName}</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">{a.addOnType}</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0] font-mono select-all">
                      {a.identifier}
                    </td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">
                      {new Date(a.createdAt).toLocaleString()}
                      {a.generatedBy && (
                        <div className="text-[9px] text-gray-500">{a.generatedBy.name}</div>
                      )}
                    </td>
                    <td className="px-2 py-1 text-right">
                      <button
                        className="opacity-60 hover:opacity-100 hover:text-red-700"
                        title="Delete this identifier"
                        onClick={() => {
                          if (!window.confirm(
                            `Delete the identifier for ${a.addOnName}?\n\n` +
                            'Anything already shipped under it keeps using it — deleting the record ' +
                            'here does not revoke it.',
                          )) return;
                          deleteMut.mutate(a.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {listQuery.isLoading && <div className="p-3 text-[10.5px] text-gray-400">Loading…</div>}
            {!listQuery.isLoading && !(listQuery.data ?? []).length && (
              <div className="p-3 text-[10.5px] text-gray-400">
                No identifiers generated yet.
              </div>
            )}
          </div>
        </>
      )}
    </ClassicWindow>
  );
};
