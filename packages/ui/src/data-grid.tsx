import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, ArrowUp, ArrowUpDown, Bookmark, Columns3, Rows3, Search } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from './cn';
import { fieldClass } from './forms';

// The list pattern of Part 12 §12.3: a filter bar over a data grid with sortable columns, a
// column chooser, a density toggle and saved views. Long lists render only the rows on screen
// (virtual rows). Saved views are a per-person convenience kept in this browser.

export type { ColumnDef } from '@tanstack/react-table';

export type GridView = { name: string; sorting: SortingState; hidden: string[] };

export type DataGridLabels = {
  columns: string;
  views: string;
  saveView: string;
  viewName: string;
  noRows: string;
  /** The density toggle's label (comfortable or compact rows, §12.6); no toggle without it. */
  density?: string;
};

/** Saved views as stored: read defensively, since browser storage can hold anything or nothing. */
export function parseViews(raw: string | null): GridView[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (v): v is GridView =>
        typeof v?.name === 'string' && Array.isArray(v.sorting) && Array.isArray(v.hidden),
    );
  } catch {
    return [];
  }
}

const VIRTUAL_FROM = 100;
const ROW_HEIGHT = 44;

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked or full: the view simply is not remembered.
  }
}

const toolbarButton =
  'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted hover:bg-subtle hover:text-fg';

export function DataGrid<T>({
  data,
  columns,
  getRowId,
  onRowClick,
  viewsKey,
  labels,
  height = 560,
}: {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Where this grid's saved views live in the browser; no saved views without it. */
  viewsKey?: string;
  labels: DataGridLabels;
  height?: number;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [visibility, setVisibility] = useState<VisibilityState>({});
  const [views, setViews] = useState<GridView[]>([]);
  const [chooser, setChooser] = useState(false);
  const [naming, setNaming] = useState<string | null>(null);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  useEffect(() => {
    if (viewsKey) setViews(parseViews(readStorage(viewsKey)));
  }, [viewsKey]);

  // No React Compiler in this repo; TanStack Table keeps its own state between renders.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting, columnVisibility: visibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const rows = table.getRowModel().rows;
  const scroller = useRef<HTMLDivElement>(null);
  const virtual = rows.length >= VIRTUAL_FROM;
  const virtualizer = useVirtualizer({
    count: virtual ? rows.length : 0,
    getScrollElement: () => scroller.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });
  const items = virtual
    ? virtualizer.getVirtualItems().map((v) => ({ row: rows[v.index]!, start: v.start }))
    : rows.map((row) => ({ row, start: 0 }));
  const padTop = virtual && items.length ? items[0]!.start : 0;
  const padBottom =
    virtual && items.length
      ? virtualizer.getTotalSize() - items[items.length - 1]!.start - ROW_HEIGHT
      : 0;

  const saveView = (raw: string) => {
    const name = raw.trim();
    setNaming(null);
    if (!name || !viewsKey) return;
    const hidden = Object.entries(visibility)
      .filter(([, shown]) => !shown)
      .map(([id]) => id);
    const next = [...views.filter((v) => v.name !== name), { name, sorting, hidden }];
    setViews(next);
    writeStorage(viewsKey, JSON.stringify(next));
  };
  const applyView = (view: GridView) => {
    setSorting(view.sorting);
    setVisibility(Object.fromEntries(view.hidden.map((id) => [id, false])));
  };

  const compact = density === 'compact';
  const cell = cn(
    'border-b border-line px-4 text-start align-middle',
    compact ? 'py-1.5' : 'py-2.5',
  );
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex flex-wrap items-center justify-end gap-1">
        {viewsKey && views.length > 0 && (
          <select
            aria-label={labels.views}
            defaultValue=""
            onChange={(e) => {
              const view = views.find((v) => v.name === e.target.value);
              if (view) applyView(view);
            }}
            className={cn(fieldClass, 'h-8 w-auto shadow-none')}
          >
            <option value="" disabled>
              {labels.views}
            </option>
            {views.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        )}
        {viewsKey && naming === null && (
          <button type="button" onClick={() => setNaming('')} className={toolbarButton}>
            <Bookmark aria-hidden className="size-4" />
            {labels.saveView}
          </button>
        )}
        {viewsKey && naming !== null && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveView(naming);
            }}
            className="flex items-center gap-1"
          >
            <input
              autoFocus
              aria-label={labels.viewName}
              placeholder={labels.viewName}
              value={naming}
              onChange={(e) => setNaming(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setNaming(null);
              }}
              className={cn(fieldClass, 'h-8 w-44 shadow-none')}
            />
            <button type="submit" className={toolbarButton}>
              {labels.saveView}
            </button>
          </form>
        )}
        {labels.density && (
          <button
            type="button"
            aria-pressed={compact}
            onClick={() => setDensity(compact ? 'comfortable' : 'compact')}
            className={toolbarButton}
          >
            <Rows3 aria-hidden className="size-4" />
            {labels.density}
          </button>
        )}
        <button
          type="button"
          aria-expanded={chooser}
          onClick={() => setChooser((c) => !c)}
          className={toolbarButton}
        >
          <Columns3 aria-hidden className="size-4" />
          {labels.columns}
        </button>
        {chooser && (
          <fieldset className="absolute end-0 top-full z-10 m-0 mt-1 grid min-w-48 gap-1.5 rounded-md border border-line bg-surface p-3 shadow-2">
            <legend className="sr-only">{labels.columns}</legend>
            {table.getAllLeafColumns().map((c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={c.getIsVisible()}
                  onChange={c.getToggleVisibilityHandler()}
                  className="size-4 accent-(--erp-color-primary)"
                />
                {typeof c.columnDef.header === 'string' ? c.columnDef.header : c.id}
              </label>
            ))}
          </fieldset>
        )}
      </div>
      <div
        ref={scroller}
        style={{ maxHeight: height }}
        className="overflow-auto rounded-lg border border-line bg-surface shadow-1"
      >
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-1 bg-subtle">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      aria-sort={
                        sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                      }
                      className={cn(
                        cell,
                        'py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-muted uppercase',
                      )}
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex cursor-pointer items-center gap-1 uppercase hover:text-fg"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === 'asc' ? (
                            <ArrowUp aria-hidden className="size-3.5" />
                          ) : sorted === 'desc' ? (
                            <ArrowDown aria-hidden className="size-3.5" />
                          ) : (
                            <ArrowUpDown aria-hidden className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {padTop > 0 && <tr style={{ height: padTop }} />}
            {items.map(({ row }) => (
              <tr
                key={row.id}
                data-row-id={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(
                  'transition-colors duration-100 hover:bg-subtle/60',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {row.getVisibleCells().map((c) => (
                  <td key={c.id} className={cn(cell, 'text-fg')}>
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {padBottom > 0 && <tr style={{ height: padBottom }} />}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  className={cn(cell, 'py-10 text-center text-muted')}
                >
                  {labels.noRows}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Search box and filter chips above a list (§12.3). */
export function FilterBar({
  search,
  onSearch,
  searchLabel,
  children,
}: {
  search: string;
  onSearch: (value: string) => void;
  searchLabel: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="relative min-w-60 flex-[1_1_280px]">
        <Search
          aria-hidden
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-faint"
        />
        <input
          type="search"
          aria-label={searchLabel}
          placeholder={searchLabel}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className={cn(fieldClass, 'h-9 ps-9')}
        />
      </div>
      {children}
    </div>
  );
}

/** One filter in a FilterBar: on or off, with its count when known. */
export function FilterChip({
  label,
  active,
  count,
  onClick,
}: {
  label: ReactNode;
  active: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors',
        active
          ? 'border-primary/40 bg-primary-subtle text-link'
          : 'border-line-strong bg-surface text-muted hover:text-fg',
      )}
    >
      {label}
      {count !== undefined && <span className="text-xs tabular opacity-80">{count}</span>}
    </button>
  );
}
