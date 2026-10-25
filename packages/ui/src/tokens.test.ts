import { describe, expect, it } from 'vitest';
import { color, colors, space, tokensCss } from './tokens';

// WCAG 2.2 relative luminance and contrast ratio (§12.6: text meets AA, 4.5:1).
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

describe('design tokens', () => {
  it('spaces on a 4 px grid', () => {
    expect(space(2)).toBe('8px');
    expect(space(0)).toBe('0px');
  });

  it('names colour variables in kebab case', () => {
    expect(color('onPrimary')).toBe('var(--erp-color-on-primary)');
  });

  it('defines every colour role for light and dark mode', () => {
    const [light, dark] = tokensCss.split('\n');
    for (const role of Object.keys(colors.light)) {
      const name = color(role as keyof typeof colors.light).slice(4, -1);
      expect(light).toContain(`${name}: `);
      expect(dark).toContain(`${name}: `);
    }
  });

  it.each(['light', 'dark'] as const)('meets WCAG AA contrast for text in %s mode', (mode) => {
    const c = colors[mode];
    for (const fg of [c.text, c.textMuted, c.success, c.danger, c.primary]) {
      expect(contrast(fg, c.background)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5);
  });
});
