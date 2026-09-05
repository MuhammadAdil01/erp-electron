import React, { useState } from 'react';
import { Eraser, Search, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { utilitiesApi } from '../../../api/administration.api';
import {
  ClassicWindow,
  ToolBtn,
  StatusNote,
  type WindowState,
} from '../../ui/ClassicWindow';
import { ClassicInput, FieldRow, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

/** A year back is a safe starting point; anything more recent is still current. */
const defaultCutoff = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
};

export const ChangeLogsCleanupWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const qc = useQueryClient();
  const companyId = activeCompanyId;

  const [olderThan, setOlderThan] = useState(defaultCutoff);
  const [preview, setPreview] = useState<{
    olderThan: string; activityLogs: number; auditEvents: number; total: number;
  } | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const onErr = (e: unknown) => {
    setError(e instanceof Error ? e.message : 'The server rejected that request.');
    setStatus('');
  };

  const previewMut = useMutation({
    mutationFn: () => utilitiesApi.previewChangeLogCleanup(olderThan),
    onSuccess: (data) => {
      setPreview(data);
      setError('');
      setStatus(`${data.activityLogs} activity row(s) are older than ${olderThan}.`);
    },
    onError: onErr,
  });

  const runMut = useMutation({
    mutationFn: () => utilitiesApi.runChangeLogCleanup(olderThan),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['activity-logs'] });
      setPreview(null);
      setError('');
      setStatus(res.message);
    },
    onError: onErr,
  });

  const isBusy = previewMut.isPending || runMut.isPending;

  const handleRun = () => {
    if (!preview) { setError('Preview first so you can see what would be removed.'); return; }
    if (!preview.activityLogs) { setError('There is nothing older than that date to remove.'); return; }
    if (!window.confirm(
      `Delete ${preview.activityLogs} activity log row(s) older than ${olderThan}?\n\n` +
      'This cannot be undone. Audit events are kept regardless — they are the record of who ' +
      'changed what.',
    )) return;
    setError('');
    runMut.mutate();
  };

  return (
    <ClassicWindow
      title="Change Logs Cleanup"
      icon={<Eraser className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={640}
      minHeight={380}
      toolbar={
        <>
          <ToolBtn onClick={() => previewMut.mutate()} disabled={isBusy || !companyId}>
            <Search className="w-3 h-3" /> {previewMut.isPending ? 'Counting…' : 'Preview'}
          </ToolBtn>
          <ToolBtn danger onClick={handleRun} disabled={isBusy || !preview?.activityLogs}>
            <Trash2 className="w-3 h-3" /> {runMut.isPending ? 'Removing…' : 'Run Cleanup'}
          </ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>{preview ? `${preview.total} row(s) match the cut-off` : 'No preview yet'}</span>
          <span>Change Logs Cleanup</span>
        </>
      }
    >
      {!companyId ? (
        <div className="p-3 text-[10px] text-gray-500 italic">
          No company selected. Open{' '}
          <span className="font-medium not-italic">Administration → Choose Company</span> first.
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto bg-white p-3 custom-scrollbar space-y-3">
          <FieldRow label="Remove Logs Older Than" labelWidth="170px" required>
            <ClassicInput
              type="date"
              value={olderThan}
              onChange={(e) => { setOlderThan(e.target.value); setPreview(null); }}
              className="w-40"
            />
          </FieldRow>

          {preview && (
            <div className="border border-[#d4d0c8] bg-[#f7f7f7] p-3 max-w-[520px]">
              <div className="text-[11px] font-bold mb-1.5">What this would remove</div>
              <table className="w-full text-[10.5px]">
                <tbody>
                  <tr className="border-b border-[#e5e5e5]">
                    <td className="py-1">Activity log rows</td>
                    <td className="py-1 text-right font-mono font-bold">{preview.activityLogs}</td>
                    <td className="py-1 text-right text-red-800 pl-3">will be deleted</td>
                  </tr>
                  <tr>
                    <td className="py-1">Audit events</td>
                    <td className="py-1 text-right font-mono">{preview.auditEvents}</td>
                    <td className="py-1 text-right text-green-800 pl-3">kept</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="text-[9.5px] text-gray-600 max-w-[560px] leading-relaxed">
            Only the activity log is removed. Audit events are deliberately excluded: they are the
            immutable, hash-chained record of who changed what, and a cleanup utility that could
            erase them would defeat the point of keeping them. If audit history genuinely has to be
            pruned, that goes through the retention policy, which is a separate and deliberate act.
          </div>
        </div>
      )}

      <div className="shrink-0 border-t border-[#d4d0c8] bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
        <YellowBtn onClick={handleRun} disabled={isBusy || !preview?.activityLogs}>OK</YellowBtn>
        <GreyBtn onClick={onClose}>Cancel</GreyBtn>
      </div>
    </ClassicWindow>
  );
};
