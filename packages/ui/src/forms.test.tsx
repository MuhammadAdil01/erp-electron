import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Banner, Input, PasswordInput } from './forms';

describe('form kit', () => {
  it('labels inputs and ties hints and errors to them for screen readers', () => {
    const html = renderToStaticMarkup(
      <Input
        id="email"
        label="E-mail"
        hint="Your work address"
        error="Enter a valid e-mail address"
      />,
    );
    expect(html).toContain('<label for="email"');
    expect(html).toContain('aria-describedby="email-hint email-error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('role="alert"');
  });

  it('shows the live password checklist, each rule marked met or not (§5.3.1)', () => {
    const html = renderToStaticMarkup(
      <PasswordInput
        id="pw"
        label="Password"
        showLabel="Show"
        hideLabel="Hide"
        checklist={[
          { key: 'length', ok: true, label: 'At least 15 characters' },
          { key: 'not_email', ok: false, label: 'Not your e-mail name' },
        ]}
      />,
    );
    expect(html).toContain('type="password"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('data-ok="true"');
    expect(html).toContain('data-ok="false"');
    expect(html).toContain('aria-live="polite"');
  });

  it('announces error banners at once and others politely', () => {
    expect(renderToStaticMarkup(<Banner tone="error">Bad</Banner>)).toContain('role="alert"');
    expect(renderToStaticMarkup(<Banner>Info</Banner>)).toContain('role="status"');
  });
});
