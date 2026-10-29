import * as RadixDialog from '@radix-ui/react-dialog';
import {
  Boxes,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  CornerDownLeft,
  Search,
} from 'lucide-react';
import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from './cn';
import { Avatar, Badge } from './kit';

// The app shell of Part 12 §12.2, shared by the company app and the Platform Console (§3.3.2):
// a top bar, a sidebar built from what the person may use, and the page. Desktop (≥ 1280 px)
// shows the full sidebar; tablets an icon rail; phones a bottom navigation. Also the command
// palette (Ctrl+K) and the centred layout of the sign-in pages. Words come from the app.

// ── Logo ─────────────────────────────────────────────────────────────────────────────────────

export function Logo({
  name,
  subtitle,
  compact,
}: {
  name: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-on-primary shadow-1">
        <Boxes aria-hidden className="size-4.5" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-fg">{name}</span>
          {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
        </span>
      )}
    </span>
  );
}

// ── Navigation ───────────────────────────────────────────────────────────────────────────────

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon?: ReactNode;
  /** Items waiting for action (§3.3.2 badges). */
  badge?: number;
  active?: boolean;
};

export type NavGroup = { key: string; label?: string; items: NavItem[] };

/** How the app renders a link (its router's Link); a plain anchor by default. */
export type RenderLink = (props: {
  href: string;
  className: string;
  children: ReactNode;
  title?: string;
  'aria-current'?: 'page';
}) => ReactNode;

const plainLink: RenderLink = ({ href, className, children, title, ...rest }) => (
  <a href={href} className={className} title={title} aria-current={rest['aria-current']}>
    {children}
  </a>
);

export function SideNav({
  groups,
  label,
  collapsed = false,
  renderLink = plainLink,
}: {
  groups: NavGroup[];
  label: string;
  collapsed?: boolean;
  renderLink?: RenderLink;
}) {
  const text = collapsed ? 'sr-only' : 'sr-only xl:not-sr-only xl:truncate';
  return (
    <nav aria-label={label} className="flex flex-col gap-5 px-3 py-4">
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-0.5">
          {group.label && (
            <div
              className={cn(
                'px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-faint uppercase',
                collapsed ? 'sr-only' : 'sr-only xl:not-sr-only',
              )}
            >
              {group.label}
            </div>
          )}
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0" data-testid={`nav-${group.key}`}>
            {group.items.map((item) => (
              <li key={item.key}>
                {renderLink({
                  href: item.href,
                  title: item.label,
                  'aria-current': item.active ? 'page' : undefined,
                  className: cn(
                    'relative flex h-9 items-center gap-3 rounded-md px-2.5 text-sm font-medium no-underline transition-colors duration-150',
                    collapsed ? 'justify-center' : 'justify-center xl:justify-start',
                    item.active
                      ? 'bg-primary-subtle text-link'
                      : 'text-muted hover:bg-subtle hover:text-fg',
                  ),
                  children: (
                    <>
                      <span className="shrink-0 [&>svg]:size-4.5">{item.icon}</span>
                      <span className={cn('min-w-0 flex-1', text)}>{item.label}</span>
                      {item.badge ? (
                        <span
                          className={cn(
                            collapsed
                              ? 'absolute end-0.5 top-0.5'
                              : 'absolute end-0.5 top-0.5 xl:static',
                          )}
                        >
                          <Badge>{item.badge}</Badge>
                        </span>
                      ) : null}
                    </>
                  ),
                })}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Phones (< 768 px): Home, Approvals, Tasks, Search, Menu at the bottom (§12.2). */
export function BottomNav({
  items,
  label,
  renderLink = plainLink,
}: {
  items: NavItem[];
  label: string;
  renderLink?: RenderLink;
}) {
  return (
    <nav aria-label={label} className="flex h-16 items-stretch justify-around px-2">
      {items.map((item) =>
        renderLink({
          href: item.href,
          'aria-current': item.active ? 'page' : undefined,
          className: cn(
            'flex min-w-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium no-underline',
            item.active ? 'text-link' : 'text-muted',
          ),
          children: (
            <>
              <span className="[&>svg]:size-5">{item.icon}</span>
              {item.label}
            </>
          ),
        }),
      )}
    </nav>
  );
}

// ── Top bar pieces ───────────────────────────────────────────────────────────────────────────

/** The search field in the top bar; it opens the command palette. */
export function SearchButton({
  label,
  shortcut = 'Ctrl K',
  onClick,
}: {
  label: string;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-full max-w-md cursor-pointer items-center gap-2 rounded-md border border-line bg-subtle px-3 text-sm text-faint transition-colors hover:border-line-strong"
    >
      <Search aria-hidden className="size-4" />
      <span className="flex-1 truncate text-start">{label}</span>
      <kbd className="hidden rounded-sm border border-line bg-surface px-1.5 font-sans text-[11px] text-muted sm:inline">
        {shortcut}
      </kbd>
    </button>
  );
}

/** A button naming the current company (or branch) that opens a switcher menu. */
export const SwitcherButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { value: ReactNode; caption?: ReactNode }
>(function SwitcherButton({ value, caption, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-9 min-w-0 cursor-pointer items-center gap-2 rounded-md px-2.5 text-start hover:bg-subtle',
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-col leading-tight">
        {caption && <span className="text-[11px] text-muted">{caption}</span>}
        <span className="truncate text-sm font-semibold text-fg">{value}</span>
      </span>
      <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-muted" />
    </button>
  );
});

/** The avatar that opens the account menu (§12.2). */
export const AvatarButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { name: string; label: string }
>(function AvatarButton({ name, label, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'cursor-pointer rounded-full ring-offset-2 hover:ring-2 hover:ring-line-strong',
        className,
      )}
      {...props}
    >
      <Avatar name={name} />
    </button>
  );
});

export function TopBar({
  start,
  center,
  end,
}: {
  start: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
}) {
  return (
    <div className="flex h-14 items-center gap-3 px-3 md:px-4">
      <div className="flex min-w-0 items-center gap-2">{start}</div>
      <div className="flex min-w-0 flex-1 justify-center px-2">{center}</div>
      <div className="flex items-center gap-1">{end}</div>
    </div>
  );
}

// ── App shell ────────────────────────────────────────────────────────────────────────────────

const COLLAPSE_KEY = 'erp.sidebar.collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

export function AppShell({
  topBar,
  nav,
  bottomNav,
  collapseLabel,
  expandLabel,
  children,
}: {
  topBar: ReactNode;
  /** The sidebar, told whether the person collapsed it to icons. */
  nav: (collapsed: boolean) => ReactNode;
  bottomNav?: ReactNode;
  collapseLabel: string;
  expandLabel: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const toggle = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
      } catch {
        // Not remembered: fine.
      }
      return !c;
    });
  };
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-fg">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm">
        {topBar}
      </header>
      <div className="flex flex-1">
        <aside
          className={cn(
            'sticky top-14 hidden h-[calc(100vh-56px)] shrink-0 flex-col border-e border-line bg-surface md:flex',
            collapsed ? 'w-16' : 'w-16 xl:w-64',
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto">{nav(collapsed)}</div>
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? expandLabel : collapseLabel}
            title={collapsed ? expandLabel : collapseLabel}
            className="m-3 hidden h-8 cursor-pointer items-center justify-center gap-2 rounded-md text-sm text-muted hover:bg-subtle hover:text-fg xl:flex"
          >
            {collapsed ? (
              <ChevronsRight aria-hidden className="size-4" />
            ) : (
              <>
                <ChevronsLeft aria-hidden className="size-4" />
                <span>{collapseLabel}</span>
              </>
            )}
          </button>
        </aside>
        <main className="min-w-0 flex-1 px-4 pt-6 pb-24 md:px-8 md:pb-12">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
      {bottomNav && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface md:hidden">
          {bottomNav}
        </div>
      )}
    </div>
  );
}

// ── Command palette (Ctrl+K) ─────────────────────────────────────────────────────────────────

export type CommandItem = {
  key: string;
  label: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  onSelect: () => void;
};

export type CommandGroup = { key: string; label: string; items: CommandItem[] };

/** Ctrl+K anywhere opens the palette (§12.2); call once in the shell. */
export function useCommandShortcut(open: () => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
}

export function CommandPalette({
  open,
  onOpenChange,
  query,
  onQueryChange,
  groups,
  title,
  placeholder,
  emptyLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
  groups: CommandGroup[];
  title: string;
  placeholder: string;
  emptyLabel: string;
}) {
  const shown = useMemo(() => groups.filter((g) => g.items.length), [groups]);
  const flat = useMemo(() => shown.flatMap((g) => g.items), [shown]);
  // Where each group starts in the flat list, for the keyboard highlight.
  const starts = useMemo(
    () => shown.map((_, gi) => shown.slice(0, gi).reduce((n, g) => n + g.items.length, 0)),
    [shown],
  );
  const [active, setActive] = useState(0);
  const choose = (item: CommandItem | undefined) => {
    if (!item) return;
    onOpenChange(false);
    item.onSelect();
  };
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45" />
        <RadixDialog.Content className="fixed start-1/2 top-[12vh] z-51 w-[min(640px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-surface text-fg shadow-3 outline-none">
          <RadixDialog.Title className="sr-only">{title}</RadixDialog.Title>
          <RadixDialog.Description className="sr-only">{placeholder}</RadixDialog.Description>
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Search aria-hidden className="size-5 text-faint" />
            <input
              autoFocus
              aria-label={title}
              value={query}
              placeholder={placeholder}
              onChange={(e) => {
                onQueryChange(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, flat.length - 1));
                else if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0));
                else if (e.key === 'Enter') choose(flat[active]);
                else return;
                e.preventDefault();
              }}
              className="h-14 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-faint"
            />
            <kbd className="rounded-sm border border-line px-1.5 text-[11px] text-muted">Esc</kbd>
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-2" role="listbox" aria-label={title}>
            {flat.length === 0 && (
              <p className="m-0 px-3 py-8 text-center text-sm text-muted">{emptyLabel}</p>
            )}
            {shown.map((group, gi) => (
              <div key={group.key} className="mb-1">
                <div className="px-3 pt-2 pb-1 text-xs font-medium text-muted">{group.label}</div>
                {group.items.map((item, ii) => {
                  const i = starts[gi]! + ii;
                  return (
                    <div
                      key={item.key}
                      role="option"
                      aria-selected={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(item)}
                      className={cn(
                        'flex h-10 cursor-pointer items-center gap-3 rounded-md px-3 text-sm',
                        i === active ? 'bg-subtle text-fg' : 'text-fg',
                      )}
                    >
                      <span className="text-muted [&>svg]:size-4">{item.icon}</span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.hint && <span className="text-xs text-muted">{item.hint}</span>}
                      {i === active && (
                        <CornerDownLeft aria-hidden className="size-3.5 text-faint" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

// ── Sign-in pages ────────────────────────────────────────────────────────────────────────────

/** The centred card of sign-in, reset, set-up and company choice. */
export function AuthLayout({
  logo,
  title,
  description,
  children,
  footer,
  wide,
}: {
  logo: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-canvas px-4 py-10 sm:justify-center">
      <div className="mb-8">{logo}</div>
      <div
        className={cn(
          'w-full rounded-xl border border-line bg-surface p-6 shadow-2 sm:p-8',
          wide ? 'max-w-[560px]' : 'max-w-[420px]',
        )}
      >
        {(title || description) && (
          <div className="mb-6">
            {title && <h1 className="m-0 text-xl font-semibold tracking-tight text-fg">{title}</h1>}
            {description && <p className="m-0 mt-1.5 text-sm text-muted">{description}</p>}
          </div>
        )}
        {children}
      </div>
      {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
    </div>
  );
}
