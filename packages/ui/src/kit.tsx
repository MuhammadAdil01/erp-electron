import * as RadixDialog from '@radix-ui/react-dialog';
import * as RadixPopover from '@radix-ui/react-popover';
import * as RadixSwitch from '@radix-ui/react-switch';
import * as RadixTabs from '@radix-ui/react-tabs';
import { useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Button } from './Button';
import { color, radii, space } from './tokens';

// The shared kit of Part 12 §12.3, §12.5–12.6, used by the Platform Console now and the company
// app later: page header, empty state, skeleton, status chip, dialog, drawer, type-the-name
// confirmation, tabs, switch, stepper and combobox. Words the components show come in as
// props, so every screen passes them through its translations.

// ── Page header, empty state, skeleton ───────────────────────────────────────────────────────

export function PageHeader({
  title,
  count,
  description,
  actions,
}: {
  title: ReactNode;
  count?: number;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header
      style={{ display: 'flex', alignItems: 'flex-start', gap: space(4), marginBlockEnd: space(4) }}
    >
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
          {title}
          {count !== undefined && (
            <span
              style={{ color: color('textMuted'), fontWeight: 400, marginInlineStart: space(2) }}
            >
              {count}
            </span>
          )}
        </h1>
        {description && (
          <p style={{ margin: `${space(1)} 0 0`, color: color('textMuted') }}>{description}</p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: space(2) }}>{actions}</div>}
    </header>
  );
}

/** One sentence of purpose and the primary action (§12.5 "Empty"). */
export function EmptyState({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div
      role="status"
      style={{
        border: `1px dashed ${color('border')}`,
        borderRadius: radii.md,
        padding: space(8),
        textAlign: 'center',
        color: color('textMuted'),
      }}
    >
      <p style={{ margin: 0 }}>{title}</p>
      {action && <div style={{ marginBlockStart: space(3) }}>{action}</div>}
    </div>
  );
}

/** Content-shaped placeholders while loading (§12.5: no full-page spinners). */
export function Skeleton({ lines = 3, label }: { lines?: number; label: string }) {
  return (
    <div aria-busy="true" aria-label={label} style={{ display: 'grid', gap: space(2) }}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          style={{
            height: 16,
            width: `${90 - (i % 3) * 15}%`,
            borderRadius: radii.sm,
            background: color('surface'),
            border: `1px solid ${color('border')}`,
          }}
        />
      ))}
    </div>
  );
}

// ── Status chip (§12.5 colours, always with text) ────────────────────────────────────────────

export type StatusTone =
  'draft' | 'pending' | 'active' | 'posted' | 'due' | 'failed' | 'cancelled' | 'offline';

/** §12.5: the same status always has the same colour, everywhere. */
export const STATUS_TONES: Readonly<Record<string, StatusTone>> = {
  draft: 'draft',
  submitted: 'pending',
  pending: 'pending',
  in_review: 'pending',
  invited: 'offline',
  approved: 'active',
  active: 'active',
  paid: 'active',
  published: 'active',
  done: 'active',
  posted: 'posted',
  partially_paid: 'due',
  due_soon: 'due',
  expired: 'due',
  overdue: 'failed',
  rejected: 'failed',
  failed: 'failed',
  suspended: 'failed',
  cancelled: 'cancelled',
  reversed: 'cancelled',
  deprecated: 'cancelled',
  archived: 'cancelled',
  removed: 'cancelled',
  offline: 'offline',
  queued: 'offline',
};

const TONE_COLOR: Record<
  StatusTone,
  'textMuted' | 'info' | 'success' | 'posted' | 'warning' | 'danger' | 'offline'
> = {
  draft: 'textMuted',
  pending: 'info',
  active: 'success',
  posted: 'posted',
  due: 'warning',
  failed: 'danger',
  cancelled: 'textMuted',
  offline: 'offline',
};

export function toneOf(status: string): StatusTone {
  return STATUS_TONES[status] ?? 'draft';
}

export function StatusChip({ status, label }: { status: string; label: string }) {
  const tone = toneOf(status);
  return (
    <span
      data-tone={tone}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: space(1),
        padding: `0 ${space(2)}`,
        borderRadius: 999,
        border: `1px solid ${color(TONE_COLOR[tone])}`,
        color: color(TONE_COLOR[tone]),
        fontSize: 13,
        lineHeight: '22px',
        whiteSpace: 'nowrap',
        textDecoration: tone === 'cancelled' ? 'line-through' : undefined,
      }}
    >
      {label}
    </span>
  );
}

// ── Dialog, drawer, type-the-name confirmation ───────────────────────────────────────────────

const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgb(0 0 0 / 0.4)',
  zIndex: 50,
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  closeLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  closeLabel: string;
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay style={overlay} />
        <RadixDialog.Content
          style={{
            position: 'fixed',
            insetBlockStart: '10vh',
            insetInlineStart: '50%',
            transform: 'translateX(-50%)',
            width: 'min(560px, calc(100vw - 32px))',
            maxHeight: '80vh',
            overflow: 'auto',
            background: color('background'),
            color: color('text'),
            borderRadius: radii.lg,
            padding: space(6),
            zIndex: 51,
            boxShadow: '0 10px 30px rgb(0 0 0 / 0.25)',
          }}
        >
          <RadixDialog.Title style={{ margin: 0, fontSize: 20 }}>{title}</RadixDialog.Title>
          {description && (
            <RadixDialog.Description style={{ color: color('textMuted') }}>
              {description}
            </RadixDialog.Description>
          )}
          <div style={{ marginBlock: space(4) }}>{children}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: space(2) }}>
            {footer}
            <RadixDialog.Close asChild>
              <Button
                style={{
                  background: color('surface'),
                  color: color('text'),
                  border: `1px solid ${color('border')}`,
                }}
              >
                {closeLabel}
              </Button>
            </RadixDialog.Close>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

/** A side panel for a quick view without leaving the page (§12.2). */
export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  closeLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  closeLabel: string;
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay style={overlay} />
        <RadixDialog.Content
          style={{
            position: 'fixed',
            insetBlock: 0,
            insetInlineEnd: 0,
            width: 'min(640px, 100vw)',
            overflow: 'auto',
            background: color('background'),
            color: color('text'),
            padding: space(6),
            zIndex: 51,
            boxShadow: '-10px 0 30px rgb(0 0 0 / 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBlockEnd: space(4),
            }}
          >
            <RadixDialog.Title style={{ margin: 0, fontSize: 20 }}>{title}</RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button
                type="button"
                aria-label={closeLabel}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  cursor: 'pointer',
                  color: color('text'),
                }}
              >
                ×
              </button>
            </RadixDialog.Close>
          </div>
          <RadixDialog.Description style={{ display: 'none' }}>{title}</RadixDialog.Description>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

/** Whether what was typed confirms an irreversible action on `name` (exact, ignoring spaces at the ends). */
export function confirmsName(typed: string, name: string): boolean {
  return typed.trim() === name.trim() && name.trim().length > 0;
}

/**
 * For irreversible platform actions (§12.5): names the object and the consequence, and the
 * button works only after the person types the object's name.
 */
export function ConfirmByNameDialog({
  open,
  onOpenChange,
  name,
  title,
  consequence,
  prompt,
  confirmLabel,
  closeLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  title: ReactNode;
  consequence: ReactNode;
  /** For example "Type the company's name to confirm". */
  prompt: string;
  confirmLabel: string;
  closeLabel: string;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState('');
  const id = useId();
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setTyped('');
        onOpenChange(next);
      }}
      title={title}
      description={consequence}
      closeLabel={closeLabel}
      footer={
        <Button
          disabled={!confirmsName(typed, name)}
          style={{ background: color('danger') }}
          onClick={() => {
            onConfirm();
            setTyped('');
          }}
        >
          {confirmLabel}
        </Button>
      }
    >
      <label htmlFor={id} style={{ display: 'block', marginBlockEnd: space(1) }}>
        {prompt}: <strong>{name}</strong>
      </label>
      <input
        id={id}
        value={typed}
        autoComplete="off"
        onChange={(e) => setTyped(e.target.value)}
        style={{
          width: '100%',
          padding: space(2),
          borderRadius: radii.md,
          border: `1px solid ${color('border')}`,
          font: 'inherit',
        }}
      />
    </Dialog>
  );
}

// ── Tabs, switch, stepper ────────────────────────────────────────────────────────────────────

export function Tabs({
  value,
  onValueChange,
  tabs,
  label,
}: {
  value: string;
  onValueChange: (value: string) => void;
  tabs: { value: string; label: ReactNode; content: ReactNode }[];
  label: string;
}) {
  return (
    <RadixTabs.Root value={value} onValueChange={onValueChange}>
      <RadixTabs.List
        aria-label={label}
        style={{
          display: 'flex',
          gap: space(1),
          borderBlockEnd: `1px solid ${color('border')}`,
          marginBlockEnd: space(4),
        }}
      >
        {tabs.map((t) => (
          <RadixTabs.Trigger
            key={t.value}
            value={t.value}
            style={{
              background: 'none',
              border: 'none',
              borderBlockEnd: `2px solid ${t.value === value ? color('primary') : 'transparent'}`,
              padding: `${space(2)} ${space(3)}`,
              font: 'inherit',
              color: t.value === value ? color('text') : color('textMuted'),
              cursor: 'pointer',
            }}
          >
            {t.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {tabs.map((t) => (
        <RadixTabs.Content key={t.value} value={t.value}>
          {t.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: space(2) }}>
      <RadixSwitch.Root
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        style={{
          width: 40,
          height: 22,
          borderRadius: 999,
          border: 'none',
          background: checked ? color('primary') : color('border'),
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <RadixSwitch.Thumb
          style={{
            display: 'block',
            width: 18,
            height: 18,
            borderRadius: 999,
            background: color('background'),
            transform: `translateX(${checked ? 20 : 2}px)`,
            transition: 'transform 150ms',
          }}
        />
      </RadixSwitch.Root>
      <label htmlFor={id}>{label}</label>
    </span>
  );
}

/** Wizard steps with titles (§12.3 "Wizard"). */
export function Stepper({
  steps,
  current,
  label,
}: {
  steps: ReactNode[];
  current: number;
  label: string;
}) {
  return (
    <ol
      aria-label={label}
      style={{
        display: 'flex',
        gap: space(4),
        listStyle: 'none',
        padding: 0,
        margin: `0 0 ${space(4)}`,
      }}
    >
      {steps.map((step, i) => (
        <li
          key={i}
          aria-current={i === current ? 'step' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: space(2),
            color: i <= current ? color('text') : color('textMuted'),
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              display: 'inline-grid',
              placeItems: 'center',
              fontSize: 13,
              background:
                i < current
                  ? color('success')
                  : i === current
                    ? color('primary')
                    : color('surface'),
              color: i <= current ? color('onPrimary') : color('textMuted'),
              border: `1px solid ${color('border')}`,
            }}
          >
            {i < current ? '✓' : i + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}

// ── Combobox (search and pick one) ───────────────────────────────────────────────────────────

export type ComboboxOption = { value: string; label: string; hint?: string };

/** Options whose label, value or hint contains every word typed, case-insensitively. */
export function filterOptions(options: readonly ComboboxOption[], query: string): ComboboxOption[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return options.filter((o) => {
    const text = `${o.label} ${o.value} ${o.hint ?? ''}`.toLowerCase();
    return words.every((w) => text.includes(w));
  });
}

export function Combobox({
  options,
  value,
  onChange,
  label,
  placeholder,
  emptyLabel,
}: {
  options: readonly ComboboxOption[];
  value: string | null;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  emptyLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const shown = useMemo(() => filterOptions(options, query).slice(0, 50), [options, query]);
  const selected = options.find((o) => o.value === value);
  const choose = (o: ComboboxOption) => {
    onChange(o.value);
    setOpen(false);
    setQuery('');
  };
  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      <RadixPopover.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          style={{
            minWidth: 240,
            textAlign: 'start',
            padding: space(2),
            borderRadius: radii.md,
            border: `1px solid ${color('border')}`,
            background: color('background'),
            color: color('text'),
            font: 'inherit',
          }}
        >
          {selected?.label ?? <span style={{ color: color('textMuted') }}>{placeholder}</span>}
        </button>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align="start"
          sideOffset={4}
          style={{
            width: 320,
            background: color('background'),
            color: color('text'),
            border: `1px solid ${color('border')}`,
            borderRadius: radii.md,
            padding: space(2),
            zIndex: 60,
          }}
        >
          <input
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-label={label}
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, shown.length - 1));
              else if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0));
              else if (e.key === 'Enter' && shown[active]) choose(shown[active]);
              else return;
              e.preventDefault();
            }}
            style={{
              width: '100%',
              padding: space(2),
              borderRadius: radii.sm,
              border: `1px solid ${color('border')}`,
              font: 'inherit',
            }}
          />
          <ul
            id={listId}
            role="listbox"
            style={{
              listStyle: 'none',
              margin: `${space(2)} 0 0`,
              padding: 0,
              maxHeight: 260,
              overflow: 'auto',
            }}
          >
            {shown.length === 0 && (
              <li style={{ color: color('textMuted'), padding: space(2) }}>{emptyLabel}</li>
            )}
            {shown.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
                style={{
                  padding: space(2),
                  borderRadius: radii.sm,
                  cursor: 'pointer',
                  background: i === active ? color('surface') : undefined,
                }}
              >
                {o.label}
                {o.hint && (
                  <span
                    style={{ color: color('textMuted'), marginInlineStart: space(2), fontSize: 13 }}
                  >
                    {o.hint}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
