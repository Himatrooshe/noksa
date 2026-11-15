"use client";
import { useEffect, useRef } from "react";

/**
 * Minimal rich-text editor (bold/italic/underline, headings, lists, links)
 * on a contentEditable region. Output is HTML that the server sanitizes on
 * save (sanitizeDescription), so nothing typed or pasted here is trusted.
 *
 * `document.execCommand` is deprecated but still supported by every major
 * browser and is by far the smallest way to do this without a dependency.
 * Uncontrolled on purpose: React re-rendering a contentEditable on every
 * keystroke would reset the caret. Remount (change `key`) to reset content.
 */
export function RichTextEditor({
  initialHtml,
  onChange,
  label,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHtml;
    // Only on mount — see the note above.
  }, []);

  function run(command: string, value?: string) {
    ref.current?.focus();
    document.execCommand(command, false, value);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function addLink() {
    const url = window.prompt("Link URL (https://…)");
    if (!url) return;
    if (!/^(https?:|mailto:|tel:)/i.test(url)) {
      window.alert("Links must start with https://, mailto: or tel:");
      return;
    }
    run("createLink", url);
  }

  const tools: { label: string; title: string; action: () => void }[] = [
    { label: "B", title: "Bold", action: () => run("bold") },
    { label: "I", title: "Italic", action: () => run("italic") },
    { label: "U", title: "Underline", action: () => run("underline") },
    { label: "H", title: "Heading", action: () => run("formatBlock", "<h3>") },
    { label: "¶", title: "Paragraph", action: () => run("formatBlock", "<p>") },
    { label: "•", title: "Bulleted list", action: () => run("insertUnorderedList") },
    { label: "1.", title: "Numbered list", action: () => run("insertOrderedList") },
    { label: "🔗", title: "Link", action: addLink },
    { label: "⌫", title: "Clear formatting", action: () => run("removeFormat") },
  ];

  return (
    <div className="rte">
      <div className="rte-toolbar" role="toolbar" aria-label="Formatting">
        {tools.map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            aria-label={t.title}
            // Keep the text selection when clicking a toolbar button.
            onMouseDown={(e) => e.preventDefault()}
            onClick={t.action}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="rte-content"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
}
