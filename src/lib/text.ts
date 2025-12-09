
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
 * Converts block-level tags and <br> to newlines, then strips tags for accurate plain text.
 */
function htmlToPlainTextWithBreaks(html: string): string {
  // Replace <br> with single newline
  let text = html.replace(/<br\s*\/?>(?![^<]*>)/gi, "\n");
  // Replace block tags with double newlines
  text = text.replace(/<(p|div|li|blockquote|h[1-6]|pre)[^>]*>/gi, "\n\n");
  // Replace </li> with double newline (for lists)
  text = text.replace(/<\/li>/gi, "\n\n");
  // Remove all other tags
  text = text.replace(/<[^>]+>/g, "");
  // Normalize whitespace and special characters
  text = text
    .replace(/[\u00A0]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r\n|\r|\n/g, "\n") // normalize all line breaks
    .replace(/[ \t]+/g, " ") // collapse spaces/tabs
    .replace(/\n{3,}/g, "\n\n") // collapse 3+ newlines to 2
    .trim();
  return text;
}

/**
 * Normalize rich text for accurate character counting and line breaks.
 * - Sanitizes HTML with the same tag/attr policy as the server
 * - Derives plain text, preserving line breaks
 */
export function normalizeRichText(html: string): NormalizeResult {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: Object.entries(allowedAttrs).flatMap(([tag, attrs]) => attrs.map(a => `${tag}.${a}`)),
    RETURN_TRUSTED_TYPE: false,
  });

  // Convert to plain text with line breaks
  const plainText = htmlToPlainTextWithBreaks(sanitizedHtml);

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
