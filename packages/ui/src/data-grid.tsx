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
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { color, radii, space } from './tokens';

// The list pattern of Part 12 §12.3: a filter bar over a data grid with sortable columns, a
// column chooser and saved views. Long lists render only the rows on screen (virtual rows).
// Saved views are a per-person convenience kept in this browser.

export type { ColumnDef } from '@tanstack/react-table';

export type GridView = { name: string; sorting: SortingState; hidden: string[] };

export type DataGridLabels = {
  columns: string;
  views: string;
  saveView: string;
  viewName: string;
  noRows: string;
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
const ROW_HEIGHT = 40;

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

  const cell = {
    padding: `${space(2)} ${space(3)}`,
    textAlign: 'start' as const,
    borderBlockEnd: `1px solid ${color('border')}`,
  };
  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: space(2),
          justifyContent: 'flex-end',
          marginBlockEnd: space(2),
          position: 'relative',
        }}
      >
        {viewsKey && views.length > 0 && (
          <select
            aria-label={labels.views}
            defaultValue=""
            onChange={(e) => {
              const view = views.find((v) => v.name === e.target.value);
              if (view) applyView(view);
            }}
            style={{ font: 'inherit', padding: space(1) }}
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
          <button
            type="button"
            onClick={() => setNaming('')}
            style={{
              font: 'inherit',
              background: 'none',
              border: 'none',
              color: color('primary'),
              cursor: 'pointer',
            }}
          >
            {labels.saveView}
          </button>
        )}
        {viewsKey && naming !== null && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveView(naming);
            }}
            style={{ display: 'flex', gap: space(1) }}
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
              style={{
                font: 'inherit',
                padding: space(1),
                borderRadius: radii.sm,
                border: `1px solid ${color('border')}`,
              }}
            />
            <button
              type="submit"
              style={{
                font: 'inherit',
                background: 'none',
                border: 'none',
                color: color('primary'),
                cursor: 'pointer',
              }}
            >
              {labels.saveView}
            </button>
          </form>
        )}
        <button
          type="button"
          aria-expanded={chooser}
          onClick={() => setChooser((c) => !c)}
          style={{
            font: 'inherit',
            background: 'none',
            border: 'none',
            color: color('primary'),
            cursor: 'pointer',
          }}
        >
          {labels.columns}
        </button>
        {chooser && (
          <fieldset
            style={{
              position: 'absolute',
              insetBlockStart: '100%',
              insetInlineEnd: 0,
              zIndex: 10,
              background: color('background'),
              border: `1px solid ${color('border')}`,
              borderRadius: radii.md,
              padding: space(3),
              display: 'grid',
              gap: space(1),
            }}
          >
            <legend style={{ fontWeight: 600 }}>{labels.columns}</legend>
            {table.getAllLeafColumns().map((c) => (
              <label key={c.id} style={{ display: 'flex', gap: space(2) }}>
                <input
                  type="checkbox"
                  checked={c.getIsVisible()}
                  onChange={c.getToggleVisibilityHandler()}
                />
                {typeof c.columnDef.header === 'string' ? c.columnDef.header : c.id}
              </label>
            ))}
          </fieldset>
        )}
      </div>
      <div
        ref={scroller}
        style={{
          maxHeight: height,
          overflow: 'auto',
          border: `1px solid ${color('border')}`,
          borderRadius: radii.md,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', insetBlockStart: 0, background: color('surface') }}>
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
                      style={{ ...cell, fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          style={{
                            font: 'inherit',
                            fontWeight: 600,
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: color('text'),
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === 'asc' ? ' ↑' : sorted === 'desc' ? ' ↓' : ''}
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
                style={{ height: ROW_HEIGHT, cursor: onRowClick ? 'pointer' : undefined }}
              >
                {row.getVisibleCells().map((c) => (
                  <td key={c.id} style={cell}>
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
                  style={{ ...cell, color: color('textMuted'), textAlign: 'center' }}
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
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: space(2),
        alignItems: 'center',
        marginBlockEnd: space(3),
      }}
    >
      <input
        type="search"
        aria-label={searchLabel}
        placeholder={searchLabel}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        style={{
          flex: '1 1 240px',
          padding: space(2),
          borderRadius: radii.md,
          border: `1px solid ${color('border')}`,
          font: 'inherit',
          background: color('background'),
          color: color('text'),
        }}
      />
      {children}
    </div>
  );
}
