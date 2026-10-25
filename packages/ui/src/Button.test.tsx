import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('is type="button" unless told otherwise, so it never submits a form by accident', () => {
    expect(renderToStaticMarkup(<Button>Save</Button>)).toContain('type="button"');
    expect(renderToStaticMarkup(<Button type="submit">Save</Button>)).toContain('type="submit"');
  });

  it('uses the colour tokens and shows when it is disabled', () => {
    const html = renderToStaticMarkup(<Button disabled>Save</Button>);
    expect(html).toContain('var(--erp-color-primary)');
    expect(html).toContain('cursor:not-allowed');
    expect(html).toContain('disabled=""');
  });
});
