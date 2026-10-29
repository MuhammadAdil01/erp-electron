import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Button, IconButton } from './Button';

describe('Button', () => {
  it('is type="button" unless told otherwise, so it never submits a form by accident', () => {
    expect(renderToStaticMarkup(<Button>Save</Button>)).toContain('type="button"');
    expect(renderToStaticMarkup(<Button type="submit">Save</Button>)).toContain('type="submit"');
  });

  it('uses the design tokens and shows when it is disabled', () => {
    const html = renderToStaticMarkup(<Button disabled>Save</Button>);
    expect(html).toContain('bg-primary');
    expect(html).toContain('disabled:cursor-not-allowed');
    expect(html).toContain('disabled=""');
    expect(renderToStaticMarkup(<Button variant="danger">Delete</Button>)).toContain(
      'bg-danger-solid',
    );
  });

  it('refuses clicks and says it is busy while loading', () => {
    const html = renderToStaticMarkup(<Button loading>Save</Button>);
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-busy="true"');
  });

  it('names icon-only buttons for screen readers', () => {
    expect(renderToStaticMarkup(<IconButton label="Notifications">x</IconButton>)).toContain(
      'aria-label="Notifications"',
    );
  });
});
