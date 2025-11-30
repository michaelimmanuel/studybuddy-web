import DOMPurify from "dompurify";

export type NormalizeResult = {
  sanitizedHtml: string;
  plainText: string;
  length: number;
};

// Mirror server sanitization policy for consistent counting
const allowedTags = [
  "p", "br", "blockquote",
  "strong", "b", "em", "i", "u", "s", "span",
  "ul", "ol", "li",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "code", "pre",
  "a",
];

const allowedAttrs: Record<string, string[]> = {
  a: ["href", "target", "rel"],
  span: ["class"],
  code: ["class"],
  pre: ["class"],
};

/**
 * Normalize rich text for accurate character counting.
 * - Sanitizes HTML with the same tag/attr policy as the server
 * - Derives plain text
 * - Normalizes whitespace, non-breaking, and zero-width characters
 */
export function normalizeRichText(html: string): NormalizeResult {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: Object.entries(allowedAttrs).flatMap(([tag, attrs]) => attrs.map(a => `${tag}.${a}`)),
    RETURN_TRUSTED_TYPE: false,
  });

  // Strip all tags to plain text
  const stripped = DOMPurify.sanitize(sanitizedHtml, { ALLOWED_TAGS: [], ALLOWED_ATTR: [], RETURN_TRUSTED_TYPE: false });

  const plainText = stripped
    .replace(/[\u00A0]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return { sanitizedHtml, plainText, length: plainText.length };
}

/** Count words for Latin scripts; for CJK prefer character count. */
export function countWords(plainText: string): number {
  const t = plainText.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

/** Detects presence of CJK scripts to optionally switch counting strategy. */
export function containsCJK(plainText: string): boolean {
  return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(plainText);
}

/**
 * Convenience: normalize then validate against a max length.
 */
export function normalizeAndValidate(html: string, maxChars: number) {
  const result = normalizeRichText(html);
  return {
    ...result,
    isValid: result.length <= maxChars,
    overBy: Math.max(0, result.length - maxChars),
  };
}
