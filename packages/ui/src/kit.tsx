import * as RadixDialog from '@radix-ui/react-dialog';
import * as RadixMenu from '@radix-ui/react-dropdown-menu';
import * as RadixPopover from '@radix-ui/react-popover';
import * as RadixSwitch from '@radix-ui/react-switch';
import * as RadixTabs from '@radix-ui/react-tabs';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { Check, ChevronDown, ChevronRight, Inbox, TrendingDown, TrendingUp, X } from 'lucide-react';
import { useId, useMemo, useState, type ReactNode } from 'react';
import { Button } from './Button';
import { cn } from './cn';
import { fieldClass } from './forms';

// The shared kit of Part 12 §12.3, §12.5–12.6, used by the Platform Console and the company
// app: page header with breadcrumbs, card, empty state, skeleton, status chip, badge, KPI tile,
// avatar, dialog, drawer, type-the-name confirmation, tabs, switch, stepper, combobox, menu and
// tooltip. Words the components show come in as props, so every screen passes them through its
// translations.

// ── Page header, breadcrumbs, card ───────────────────────────────────────────────────────────

export type Crumb = { label: ReactNode; href?: string };

export function Breadcrumbs({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0 text-sm text-muted">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight aria-hidden className="size-3.5 text-faint" />}
            {c.href && i < items.length - 1 ? (
              <a href={c.href} className="text-muted no-underline hover:text-fg hover:underline">
                {c.label}
              </a>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  count,
  description,
  actions,
  status,
  breadcrumbs,
}: {
  title: ReactNode;
  count?: number;
  description?: ReactNode;
  actions?: ReactNode;
  /** A status chip next to the title of a record page. */
  status?: ReactNode;
  /** Breadcrumbs above the title, as rendered by <Breadcrumbs>. */
  breadcrumbs?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-2">
      {breadcrumbs}
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 flex flex-wrap items-center gap-3 text-xl font-semibold tracking-tight text-fg">
            <span>{title}</span>
            {count !== undefined && (
              <span className="rounded-full bg-neutral-subtle px-2.5 text-sm font-medium text-muted tabular">
                {count}
              </span>
            )}
            {status}
          </h1>
          {description && <p className="m-0 mt-1 max-w-3xl text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** A surface panel with an optional title and actions. */
export function Card({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn('rounded-lg border border-line bg-surface shadow-1', className)}>
      {(title || actions) && (
        <header className="flex items-start gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            {title && <h2 className="m-0 text-base font-semibold text-fg">{title}</h2>}
            {description && <p className="m-0 mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={padded ? 'p-5' : undefined}>{children}</div>
    </section>
  );
}

// ── Empty state, skeleton ────────────────────────────────────────────────────────────────────

/** One sentence of purpose and the primary action (§12.5 "Empty"). */
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line-strong bg-surface px-6 py-12 text-center"
    >
      <span className="mb-1 flex size-10 items-center justify-center rounded-full bg-subtle text-muted">
        {icon ?? <Inbox aria-hidden className="size-5" />}
      </span>
      <p className="m-0 text-sm font-medium text-fg">{title}</p>
      {description && <p className="m-0 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Content-shaped placeholders while loading (§12.5: no full-page spinners). */
export function Skeleton({ lines = 3, label }: { lines?: number; label: string }) {
  return (
    <div aria-busy="true" aria-label={label} className="grid gap-3">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded-sm bg-subtle"
          style={{ width: `${90 - (i % 3) * 15}%` }}
        />
      ))}
    </div>
  );
}

// ── Status chip (§12.5 colours, always with text), badge ─────────────────────────────────────

export type StatusTone =
  'draft' | 'pending' | 'active' | 'posted' | 'due' | 'failed' | 'cancelled' | 'offline';

/** §12.5: the same status always has the same colour, everywhere. */
export const STATUS_TONES: Readonly<Record<string, StatusTone>> = {
  draft: 'draft',
  submitted: 'pending',
  pending: 'pending',
  in_review: 'pending',
  trial: 'pending',
  invited: 'offline',
  approved: 'active',
  active: 'active',
  paid: 'active',
  published: 'active',
  done: 'active',
  success: 'active',
  posted: 'posted',
  partially_paid: 'due',
  due_soon: 'due',
  past_due: 'due',
  expired: 'due',
  overdue: 'failed',
  rejected: 'failed',
  failed: 'failed',
  failure: 'failed',
  suspended: 'failed',
  cancelled: 'cancelled',
  reversed: 'cancelled',
  deprecated: 'cancelled',
  archived: 'cancelled',
  removed: 'cancelled',
  offline: 'offline',
  queued: 'offline',
};

const TONE_CLASS: Record<StatusTone, string> = {
  draft: 'bg-neutral-subtle text-muted',
  pending: 'bg-info-subtle text-info',
  active: 'bg-success-subtle text-success',
  posted: 'bg-success-subtle text-posted',
  due: 'bg-warning-subtle text-warning',
  failed: 'bg-danger-subtle text-danger',
  cancelled: 'bg-neutral-subtle text-muted line-through',
  offline: 'bg-offline-subtle text-offline',
};

export function toneOf(status: string): StatusTone {
  return STATUS_TONES[status] ?? 'draft';
}

export function StatusChip({ status, label }: { status: string; label: string }) {
  const tone = toneOf(status);
  return (
    <span
      data-tone={tone}
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASS[tone],
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

/** A small count, for example waiting approvals beside a menu entry. */
export function Badge({
  children,
  tone = 'primary',
}: {
  children: ReactNode;
  tone?: 'primary' | 'neutral' | 'danger';
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular',
        tone === 'primary' && 'bg-primary text-on-primary',
        tone === 'neutral' && 'bg-neutral-subtle text-muted',
        tone === 'danger' && 'bg-danger-solid text-white',
      )}
    >
      {children}
    </span>
  );
}

// ── KPI tile, avatar ─────────────────────────────────────────────────────────────────────────

/** A number on a home dashboard (§12.3 "Home dashboard"). */
export function KpiTile({
  label,
  value,
  delta,
  hint,
  icon,
  trend,
}: {
  label: ReactNode;
  value: ReactNode;
  /** For example "+12% vs last month". */
  delta?: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-5 shadow-1">
      <div className="flex items-center justify-between gap-2 text-sm text-muted">
        <span>{label}</span>
        {icon && <span className="text-faint">{icon}</span>}
      </div>
      <div className="text-xl font-semibold tracking-tight text-fg tabular">{value}</div>
      {(delta || hint) && (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          {delta && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-medium',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-danger',
              )}
            >
              {trend === 'up' && <TrendingUp aria-hidden className="size-3.5" />}
              {trend === 'down' && <TrendingDown aria-hidden className="size-3.5" />}
              {delta}
            </span>
          )}
          {hint}
        </div>
      )}
    </div>
  );
}

export function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]!)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-primary-subtle font-semibold text-link',
        size === 'sm' ? 'size-7 text-xs' : 'size-8 text-xs',
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

// ── Dialog, drawer, type-the-name confirmation ───────────────────────────────────────────────

const overlayClass = 'fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[1px]';

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  closeLabel,
  size = 'md',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  closeLabel: string;
  size?: 'md' | 'lg';
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={overlayClass} />
        <RadixDialog.Content
          className={cn(
            'fixed start-1/2 top-[10vh] z-51 flex max-h-[80vh] w-[calc(100vw-32px)] -translate-x-1/2 flex-col rounded-lg border border-line bg-surface text-fg shadow-3 outline-none',
            size === 'lg' ? 'max-w-[760px]' : 'max-w-[520px]',
          )}
        >
          <div className="flex items-start gap-3 px-6 pt-5">
            <div className="min-w-0 flex-1">
              <RadixDialog.Title className="m-0 text-lg font-semibold">{title}</RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="m-0 mt-1 text-sm text-muted">
                  {description}
                </RadixDialog.Description>
              ) : (
                <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
              )}
            </div>
          </div>
          <div className="min-h-0 overflow-auto px-6 py-4">{children}</div>
          <div className="flex justify-end gap-2 border-t border-line bg-subtle/50 px-6 py-3">
            <RadixDialog.Close asChild>
              <Button variant="secondary">{closeLabel}</Button>
            </RadixDialog.Close>
            {footer}
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
        <RadixDialog.Overlay className={overlayClass} />
        <RadixDialog.Content className="fixed inset-y-0 end-0 z-51 flex w-[min(600px,100vw)] flex-col border-s border-line bg-surface text-fg shadow-3 outline-none">
          <div className="flex items-center gap-3 border-b border-line px-6 py-4">
            <RadixDialog.Title className="m-0 min-w-0 flex-1 truncate text-lg font-semibold">
              {title}
            </RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button
                type="button"
                aria-label={closeLabel}
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-fg"
              >
                <X aria-hidden className="size-4" />
              </button>
            </RadixDialog.Close>
          </div>
          <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
          <div className="min-h-0 flex-1 overflow-auto px-6 py-5">{children}</div>
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
          variant="danger"
          disabled={!confirmsName(typed, name)}
          onClick={() => {
            onConfirm();
            setTyped('');
          }}
        >
          {confirmLabel}
        </Button>
      }
    >
      <label htmlFor={id} className="mb-1.5 block text-sm">
        {prompt}: <strong>{name}</strong>
      </label>
      <input
        id={id}
        value={typed}
        autoComplete="off"
        onChange={(e) => setTyped(e.target.value)}
        className={cn(fieldClass, 'h-9')}
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
      <RadixTabs.List aria-label={label} className="mb-5 flex gap-1 border-b border-line">
        {tabs.map((t) => (
          <RadixTabs.Trigger
            key={t.value}
            value={t.value}
            className="-mb-px cursor-pointer border-b-2 border-transparent px-3 pt-1 pb-2.5 text-sm font-medium text-muted transition-colors hover:text-fg data-[state=active]:border-primary data-[state=active]:text-fg"
          >
            {t.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {tabs.map((t) => (
        <RadixTabs.Content key={t.value} value={t.value} className="outline-none">
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
    <span className="inline-flex items-center gap-2.5">
      <RadixSwitch.Root
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-line-strong transition-colors duration-150 data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-55"
      >
        <RadixSwitch.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow-1 transition-transform duration-150 data-[state=checked]:translate-x-[18px]" />
      </RadixSwitch.Root>
      <label htmlFor={id} className="cursor-pointer text-sm text-fg">
        {label}
      </label>
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
    <ol aria-label={label} className="m-0 mb-6 flex list-none flex-wrap items-center gap-2 p-0">
      {steps.map((step, i) => (
        <li
          key={i}
          aria-current={i === current ? 'step' : undefined}
          className={cn(
            'flex items-center gap-2 text-sm',
            i === current ? 'font-semibold text-fg' : i < current ? 'text-fg' : 'text-muted',
          )}
        >
          {i > 0 && <span aria-hidden className="me-1 h-px w-8 bg-line-strong" />}
          <span
            className={cn(
              'inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold',
              i < current && 'bg-success text-white',
              i === current && 'bg-primary text-on-primary',
              i > current && 'border border-line-strong bg-surface text-muted',
            )}
          >
            {i < current ? <Check aria-hidden strokeWidth={3} className="size-3.5" /> : i + 1}
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
          className={cn(
            fieldClass,
            'flex h-9 min-w-60 cursor-pointer items-center justify-between gap-2 text-start',
          )}
        >
          {selected?.label ?? <span className="text-faint">{placeholder}</span>}
          <ChevronDown aria-hidden className="size-4 text-muted" />
        </button>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align="start"
          sideOffset={4}
          className="z-60 w-80 rounded-md border border-line bg-surface p-1.5 text-fg shadow-2"
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
            className={cn(fieldClass, 'h-8 shadow-none')}
          />
          <ul
            id={listId}
            role="listbox"
            className="m-0 mt-1.5 max-h-64 list-none overflow-auto p-0"
          >
            {shown.length === 0 && <li className="px-2 py-2 text-sm text-muted">{emptyLabel}</li>}
            {shown.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
                  i === active && 'bg-subtle',
                )}
              >
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {o.hint && <span className="text-xs text-muted">{o.hint}</span>}
                {o.value === value && <Check aria-hidden className="size-4 text-link" />}
              </li>
            ))}
          </ul>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}

// ── Menu, tooltip ────────────────────────────────────────────────────────────────────────────

export type MenuItem =
  | {
      key: string;
      label: ReactNode;
      icon?: ReactNode;
      onSelect: () => void;
      danger?: boolean;
      /** Shown as a check mark, for choices such as the theme. */
      checked?: boolean;
    }
  | { key: string; separator: true }
  | { key: string; heading: ReactNode };

/** A dropdown of actions (Radix: keyboard navigation and focus return). */
export function Menu({
  trigger,
  items,
  align = 'end',
  header,
}: {
  trigger: ReactNode;
  items: MenuItem[];
  align?: 'start' | 'end';
  /** Something above the items, such as who is signed in. */
  header?: ReactNode;
}) {
  return (
    <RadixMenu.Root>
      <RadixMenu.Trigger asChild>{trigger}</RadixMenu.Trigger>
      <RadixMenu.Portal>
        <RadixMenu.Content
          align={align}
          sideOffset={6}
          className="z-60 min-w-56 rounded-md border border-line bg-surface p-1.5 text-sm text-fg shadow-2"
        >
          {header && <div className="px-2 pt-1 pb-2">{header}</div>}
          {items.map((item) =>
            'separator' in item ? (
              <RadixMenu.Separator key={item.key} className="my-1.5 h-px bg-line" />
            ) : 'heading' in item ? (
              <RadixMenu.Label
                key={item.key}
                className="px-2 pt-1.5 pb-1 text-xs font-medium text-muted"
              >
                {item.heading}
              </RadixMenu.Label>
            ) : (
              <RadixMenu.Item
                key={item.key}
                onSelect={item.onSelect}
                className={cn(
                  'flex h-8 cursor-pointer items-center gap-2.5 rounded-sm px-2 outline-none select-none data-highlighted:bg-subtle',
                  item.danger && 'text-danger',
                )}
              >
                {item.icon && <span className="text-muted [&>svg]:size-4">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.checked && <Check aria-hidden className="size-4 text-link" />}
              </RadixMenu.Item>
            ),
          )}
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  );
}

export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={300}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            sideOffset={6}
            className="z-70 rounded-sm bg-slate-900 px-2 py-1 text-xs text-white shadow-2"
          >
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
