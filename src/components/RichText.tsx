"use client";

import DOMPurify from "dompurify";
import { useMemo } from "react";

interface RichTextProps {
  html?: string | null;
  className?: string;
}

export default function RichText({ html, className }: RichTextProps) {
  const sanitized = useMemo(() => {
    if (!html) return "";
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br"],
      ALLOWED_ATTR: []
    });
  }, [html]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
