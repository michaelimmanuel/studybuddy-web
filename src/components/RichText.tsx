"use client";

import { useMemo } from "react";
import { normalizeRichText } from "@/lib/text";

interface RichTextProps {
  html?: string | null;
  className?: string;
}

export default function RichText({ html, className }: RichTextProps) {
  const sanitized = useMemo(() => {
    if (!html) return "";
    return normalizeRichText(html).sanitizedHtml;
  }, [html]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
