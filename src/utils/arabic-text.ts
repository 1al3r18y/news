/**
 * arabic-text.ts — Arabic/RTL text reshaping utilities for WebGL rendering.
 *
 * WebGL canvases (deck.gl TextLayer, raw Canvas2D) render each Unicode code-point
 * independently, ignoring Arabic Complex Text Layout (CTL) joining rules.
 * This module wraps the `arabic-reshaper` library to produce presentation-form
 * glyphs and reverses them for correct RTL visual order in left-to-right WebGL
 * text rendering pipelines.
 *
 * Usage:
 *   import { reshapeArabic } from '@/utils/arabic-text';
 *   getText: (d) => reshapeArabic(d.label),
 */

import ArabicReshaper from 'arabic-reshaper';

// Unicode range for Arabic characters (Basic Arabic + Arabic Supplement + Extended-A/B)
const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Detect whether a string contains any Arabic/Persian/Urdu characters.
 */
export function containsArabic(text: string): boolean {
  return ARABIC_RE.test(text);
}

/**
 * Reshape Arabic text for correct WebGL / Canvas rendering.
 *
 * 1. Runs `arabic-reshaper` to convert Arabic characters to their
 *    contextual presentation forms (initial / medial / final / isolated).
 * 2. Reverses the character order so the RTL text renders correctly
 *    in a left-to-right WebGL text pipeline.
 *
 * Non-Arabic strings are returned unchanged for zero overhead.
 *
 * @param text - The raw Unicode string that may contain Arabic.
 * @returns The reshaped + reversed string ready for WebGL rendering.
 */
export function reshapeArabic(text: string): string {
  if (!text || !containsArabic(text)) return text;

  try {
    // arabic-reshaper converts characters to their joined presentation forms
    const shaped = ArabicReshaper.convertArabic(text);

    // Reverse for RTL→LTR visual order in WebGL
    return reverseRTL(shaped);
  } catch {
    // Fallback: return original text rather than break rendering
    return text;
  }
}

/**
 * Reverse a string while keeping Latin/number runs in their original order.
 * This handles mixed Arabic + Latin text (e.g. "مطار JFK الدولي").
 */
function reverseRTL(text: string): string {
  // Split into RTL (Arabic presentation forms + Arabic) and LTR (Latin/digits) segments
  const segments: { text: string; isRTL: boolean }[] = [];
  let current = '';
  let currentIsRTL: boolean | null = null;

  for (const char of text) {
    const charIsRTL = ARABIC_RE.test(char) || /[\uFB50-\uFDFF\uFE70-\uFEFF]/.test(char);

    if (currentIsRTL !== null && charIsRTL !== currentIsRTL && current.trim()) {
      segments.push({ text: current, isRTL: currentIsRTL });
      current = '';
    }

    current += char;
    currentIsRTL = charIsRTL;
  }

  if (current) {
    segments.push({ text: current, isRTL: currentIsRTL ?? false });
  }

  // Reverse overall segment order (RTL), but keep LTR segments' internal order
  return segments
    .reverse()
    .map(seg => (seg.isRTL ? [...seg.text].reverse().join('') : seg.text))
    .join('');
}
