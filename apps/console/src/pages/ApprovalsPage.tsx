import type { Approval } from '@erp/contracts';
import { Button, Dialog, EmptyState, Input, PageHeader, Tabs } from '@erp/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sdk } from '../auth';
import { reloadStaffAccess, useStaffAccess } from '../staff-access';
import { Loaded, Status, useChange, useResource, when } from '../lib';
import { useStepUp } from '../step-up';

// Four-eyes approvals (Part 03 §3.2.1 ◐): changes waiting for a second eligible person, with
// the requester, the reason and what would change. Nobody decides their own request; the
// requester can withdraw it.

export function ApprovalsPage() {
  const { t } = useTranslation();
  const access = useStaffAccess();
  const change = useChange();
  const stepUp = useStepUp();
  const [tab, setTab] = useState('waiting');
  const approvals = useResource(
    () => sdk.console.approvals.list(tab === 'waiting' ? 'pending' : undefined),
    [tab],
  );
  const [deciding, setDeciding] = useState<{
    approval: Approval;
    verdict: 'approve' | 'reject';
  } | null>(null);
  const [note, setNote] = useState('');
  const after = () => {
    setDeciding(null);
    setNote('');
    approvals.reload();
    void reloadStaffAccess(); // the badge
  };

  const list = (items: Approval[]) =>
    items.length === 0 ? (
      <EmptyState title={t('console.common.no_rows')} />
    ) : (
      <ul className="grid gap-3" data-testid="approvals">
        {items.map((a) => (
          <li key={a.id} className="rounded-lg border border-line bg-surface p-4 shadow-1">
            <div className="flex items-center gap-2">
              <strong className="flex-1">
                {t(`console.approvals.${a.action.replace('.', '_')}`)} · {a.target_id}
              </strong>
              <Status status={a.status} />
            </div>
            <p className="text-sm">
              {t('console.approvals.requested_by')}: {a.requested_by.name} · {when(a.requested_at)}
            </p>
            <p className="text-sm">
              {t('console.common.reason')}: {a.reason}
            </p>
            {Object.keys(a.payload).length > 0 && (
              <pre dir="ltr" className="overflow-auto rounded-md bg-subtle p-3 text-xs">
                {JSON.stringify(a.payload, null, 2)}
              </pre>
            )}
            {a.decided_by && (
              <p className="text-sm">
                {t('console.approvals.decided_by')}: {a.decided_by.name} · {when(a.decided_at)}
                {a.decision_note ? ` · ${a.decision_note}` : ''}
              </p>
            )}
            {a.status === 'pending' && (
              <div className="mt-2 flex gap-2">
                {a.can_decide && (
                  <>
                    <Button onClick={() => setDeciding({ approval: a, verdict: 'approve' })}>
                      {t('console.approvals.approve')}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setDeciding({ approval: a, verdict: 'reject' })}
                    >
                      {t('console.approvals.reject')}
                    </Button>
                  </>
                )}
                {a.requested_by.id === access?.staff_id && (
                  <>
                    <em className="self-center text-sm">{t('console.approvals.own')}</em>
                    <Button
                      onClick={() => void change(() => sdk.console.approvals.cancel(a.id), after)}
                    >
                      {t('console.approvals.withdraw')}
                    </Button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <PageHeader title={t('console.approvals.title')} />
      <Tabs
        value={tab}
        onValueChange={setTab}
        label={t('console.approvals.title')}
        tabs={[
          {
            value: 'waiting',
            label: t('console.approvals.waiting'),
            content: <Loaded resource={approvals}>{(d) => list(d.data)}</Loaded>,
          },
          {
            value: 'history',
            label: t('console.approvals.history'),
            content: <Loaded resource={approvals}>{(d) => list(d.data)}</Loaded>,
          },
        ]}
      />
      <Dialog
        open={deciding !== null}
        onOpenChange={(o) => !o && setDeciding(null)}
        title={
          deciding
            ? `${t(`console.approvals.${deciding.verdict}`)}: ${deciding.approval.target_id}`
            : ''
        }
        closeLabel={t('common.cancel')}
        footer={
          <Button
            disabled={deciding?.verdict === 'reject' && note.trim().length < 3}
            onClick={() => {
              const d = deciding!;
              void change(
                () =>
                  d.verdict === 'approve'
                    ? stepUp(() =>
                        sdk.console.approvals.approve(d.approval.id, note.trim() || undefined),
                      )
                    : sdk.console.approvals.reject(d.approval.id, note.trim()),
                after,
              );
            }}
          >
            {deciding ? t(`console.approvals.${deciding.verdict}`) : ''}
          </Button>
        }
      >
        <Input
          label={
            deciding?.verdict === 'reject'
              ? t('console.approvals.note_required')
              : t('console.approvals.note')
          }
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Dialog>
    </>
  );
}
