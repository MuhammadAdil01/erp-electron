import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('Platform Console', () => {
  it('renders its heading', () => {
    expect(renderToStaticMarkup(<App />)).toContain('<h1>Platform Console</h1>');
  });
});
