import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DataGrid, parseViews, type ColumnDef } from './data-grid';
import { confirmsName, EmptyState, filterOptions, PageHeader, StatusChip, toneOf } from './kit';

describe('status chips (Part 12 §12.5)', () => {
  it('give each status its colour family and always carry the text', () => {
    expect(toneOf('draft')).toBe('draft');
    expect(toneOf('in_review')).toBe('pending');
    expect(toneOf('published')).toBe('active');
    expect(toneOf('posted')).toBe('posted');
    expect(toneOf('rejected')).toBe('failed');
    expect(toneOf('invited')).toBe('offline');
    expect(toneOf('something-new')).toBe('draft');
    const html = renderToStaticMarkup(<StatusChip status="deprecated" label="Deprecated" />);
    expect(html).toContain('Deprecated');
    expect(html).toContain('line-through');
    expect(html).toContain('data-tone="cancelled"');
  });
});

describe('type-the-name confirmation', () => {
  it('accepts only the exact name', () => {
    expect(confirmsName('Al-Naik Foods', 'Al-Naik Foods')).toBe(true);
    expect(confirmsName('  Al-Naik Foods ', 'Al-Naik Foods')).toBe(true);
    expect(confirmsName('al-naik foods', 'Al-Naik Foods')).toBe(false);
    expect(confirmsName('', '')).toBe(false);
  });
});

describe('combobox filtering', () => {
  const options = [
    { value: 'restaurant.floor', label: 'Floors & Tables', hint: 'restaurant' },
    { value: 'school.sis', label: 'Students', hint: 'school' },
  ];
  it('matches every word against label, value and hint', () => {
    expect(filterOptions(options, 'floor').map((o) => o.value)).toEqual(['restaurant.floor']);
    expect(filterOptions(options, 'SCHOOL students').map((o) => o.value)).toEqual(['school.sis']);
    expect(filterOptions(options, '')).toHaveLength(2);
  });
});

describe('page header and empty state', () => {
  it('show the title, the count and the action', () => {
    const html = renderToStaticMarkup(
      <PageHeader title="Staff" count={7} actions={<button>Invite</button>} />,
    );
    expect(html).toContain('Staff');
    expect(html).toContain('>7<');
    expect(html).toContain('Invite');
    expect(renderToStaticMarkup(<EmptyState title="No requests yet" />)).toContain('role="status"');
  });
});

describe('DataGrid (Part 12 §12.3 list pattern)', () => {
  type Row = { id: string; name: string; status: string };
  const columns: ColumnDef<Row, unknown>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'status', header: 'Status', enableSorting: false },
  ];
  const labels = {
    columns: 'Columns',
    views: 'Views',
    saveView: 'Save view',
    viewName: 'View name',
    noRows: 'Nothing here',
  };

  it('renders headers, rows and sortable columns', () => {
    const html = renderToStaticMarkup(
      <DataGrid
        data={[{ id: 'a', name: 'Alpha', status: 'active' }]}
        columns={columns}
        getRowId={(r) => r.id}
        labels={labels}
      />,
    );
    expect(html).toContain('Name');
    expect(html).toContain('data-row-id="a"');
    expect(html).toContain('Alpha');
    expect(html).toContain('aria-sort="none"');
    expect(html.match(/<button/g)?.length).toBe(2); // the Name sort button and "Columns"
  });

  it('says so when there are no rows', () => {
    expect(
      renderToStaticMarkup(
        <DataGrid data={[]} columns={columns} getRowId={(r: Row) => r.id} labels={labels} />,
      ),
    ).toContain('Nothing here');
  });

  it('reads saved views defensively', () => {
    expect(parseViews(null)).toEqual([]);
    expect(parseViews('not json')).toEqual([]);
    expect(parseViews('{"name":"x"}')).toEqual([]);
    expect(
      parseViews(
        '[{"name":"Mine","sorting":[{"id":"name","desc":true}],"hidden":["status"]},{"name":1}]',
      ),
    ).toEqual([{ name: 'Mine', sorting: [{ id: 'name', desc: true }], hidden: ['status'] }]);
  });
});
