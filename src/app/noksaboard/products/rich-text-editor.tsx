"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Minimal rich-text editor (bold/italic/underline, headings, lists, links)
 * on a contentEditable region. Output is HTML that the server sanitizes on
 * save, so nothing typed or pasted here is trusted.
 *
 * `document.execCommand` is deprecated but still supported by every major
 * browser and is by far the smallest way to do this without a dependency.
 * Uncontrolled on purpose: React re-rendering a contentEditable on every
 * keystroke would reset the caret. Remount (change `key`) to reset content.
 *
 * Pass `uploadImage` to add an image button (and quote/divider tools) for
 * long-form writing such as blog posts.
 */
export function RichTextEditor({
  initialHtml,
  onChange,
  label,
  uploadImage,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
  label: string;
  uploadImage?: (file: File) => Promise<string>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

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

  // The file picker steals focus, so remember where the caret was.
  function rememberCaret() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount && ref.current?.contains(selection.anchorNode)) {
      savedRange.current = selection.getRangeAt(0).cloneRange();
    } else {
      savedRange.current = null;
    }
    fileInput.current?.click();
  }

  async function insertImage(file?: File) {
    if (!file || !uploadImage) return;
    setMessage("");
    setUploading(true);
    try {
      const url = await uploadImage(file);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const editor = ref.current;
      if (!editor) return;
      editor.focus();
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        if (savedRange.current) selection.addRange(savedRange.current);
        else {
          const end = document.createRange();
          end.selectNodeContents(editor);
          end.collapse(false);
          selection.addRange(end);
        }
      }
      const img = document.createElement("img");
      img.src = url;
      img.alt = alt;
      document.execCommand("insertHTML", false, `<p>${img.outerHTML}</p><p><br></p>`);
      onChange(editor.innerHTML);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The image could not be uploaded.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const tools: { label: string; title: string; action: () => void }[] = [
    { label: "B", title: "Bold", action: () => run("bold") },
    { label: "I", title: "Italic", action: () => run("italic") },
    { label: "U", title: "Underline", action: () => run("underline") },
    ...(uploadImage
      ? [
          { label: "H2", title: "Heading", action: () => run("formatBlock", "<h2>") },
          { label: "H3", title: "Subheading", action: () => run("formatBlock", "<h3>") },
        ]
      : [{ label: "H", title: "Heading", action: () => run("formatBlock", "<h3>") }]),
    { label: "¶", title: "Paragraph", action: () => run("formatBlock", "<p>") },
    { label: "•", title: "Bulleted list", action: () => run("insertUnorderedList") },
    { label: "1.", title: "Numbered list", action: () => run("insertOrderedList") },
    ...(uploadImage
      ? [
          { label: "❝", title: "Quote", action: () => run("formatBlock", "<blockquote>") },
          { label: "—", title: "Divider", action: () => run("insertHorizontalRule") },
        ]
      : []),
    { label: "🔗", title: "Link", action: addLink },
    ...(uploadImage ? [{ label: "🖼", title: "Insert image", action: rememberCaret }] : []),
    { label: "⌫", title: "Clear formatting", action: () => run("removeFormat") },
  ];

  return (
    <div className={uploadImage ? "rte rte-long" : "rte"}>
      <div className="rte-toolbar" role="toolbar" aria-label="Formatting">
        {tools.map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            aria-label={t.title}
            disabled={uploading && t.title === "Insert image"}
            // Keep the text selection when clicking a toolbar button.
            onMouseDown={(e) => e.preventDefault()}
            onClick={t.action}
          >
            {t.label}
          </button>
        ))}
        {uploading && <span className="rte-status">Uploading image…</span>}
      </div>
      {uploadImage && (
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => insertImage(e.target.files?.[0])}
        />
      )}
      {message && (
        <p className="board-error rte-message" role="alert">
          {message}
        </p>
      )}
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
