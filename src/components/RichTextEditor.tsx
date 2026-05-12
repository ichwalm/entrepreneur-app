"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function normalizeHtml(html: string) {
  return html.replaceAll(/\u00a0/g, " ").trim();
}

export function RichTextEditor(props: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [focused, setFocused] = useState(false);

  const placeholder = props.placeholder ?? "Tulis deskripsi...";
  const isEmpty = useMemo(() => {
    const v = normalizeHtml(props.value || "");
    return v === "" || v === "<br>" || v === "<p><br></p>";
  }, [props.value]);

  useEffect(() => {
    if (!ref.current) return;
    const current = normalizeHtml(ref.current.innerHTML);
    const next = normalizeHtml(props.value || "");
    if (current !== next) ref.current.innerHTML = next;
  }, [props.value]);

  function exec(cmd: string, value?: string) {
    if (!ref.current) return;
    ref.current.focus();
    document.execCommand(cmd, false, value);
    props.onChange(normalizeHtml(ref.current.innerHTML));
  }

  function onInput() {
    if (!ref.current) return;
    props.onChange(normalizeHtml(ref.current.innerHTML));
  }

  function addLink() {
    const url = prompt("Masukkan URL (https://...)");
    if (!url) return;
    exec("createLink", url);
  }

  return (
    <div className="rounded-xl border border-accent bg-background">
      <div className="flex flex-wrap items-center gap-2 border-b border-accent px-3 py-2">
        <ToolButton
          label="Bold"
          onClick={() => exec("bold")}
          text="B"
          className="font-bold"
        />
        <ToolButton
          label="Italic"
          onClick={() => exec("italic")}
          text="I"
          className="italic"
        />
        <ToolButton
          label="Underline"
          onClick={() => exec("underline")}
          text="U"
          className="underline"
        />
        <Separator />
        <ToolButton label="Bullets" onClick={() => exec("insertUnorderedList")} text="•" />
        <ToolButton label="Numbered" onClick={() => exec("insertOrderedList")} text="1." />
        <Separator />
        <ToolButton label="Quote" onClick={() => exec("formatBlock", "blockquote")} text="❝" />
        <ToolButton label="Link" onClick={addLink} text="🔗" />
        <ToolButton label="Clear" onClick={() => exec("removeFormat")} text="⟲" />
        <div className="ml-auto text-xs text-foreground/60">
          Rich text (basic)
        </div>
      </div>

      <div className="relative">
        {isEmpty && !focused ? (
          <div className="pointer-events-none absolute left-4 top-3 text-sm text-foreground/40">
            {placeholder}
          </div>
        ) : null}
        <div
          id={props.id}
          ref={ref}
          onInput={onInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          contentEditable
          role="textbox"
          aria-multiline="true"
          className="min-h-40 px-4 py-3 text-sm leading-7 outline-none"
        />
      </div>
    </div>
  );
}

function ToolButton(props: {
  label: string;
  text: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={props.label}
      onClick={props.onClick}
      className={`rounded-lg border border-accent bg-accent/10 px-2 py-1 text-xs hover:bg-accent ${
        props.className ?? ""
      }`}
    >
      {props.text}
    </button>
  );
}

function Separator() {
  return <span className="mx-1 h-5 w-px bg-accent/60" aria-hidden="true" />;
}

