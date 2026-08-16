"use client";

import { useRef } from "react";
import { Bold, Italic, Link as LinkIcon, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/**
 * A deliberately lightweight rich text editor — a styled contentEditable
 * div with a small formatting toolbar, not a full WYSIWYG library. Output
 * is HTML, synced into a hidden <textarea> so it submits like any other
 * form field with a Server Action. Good enough for product/page
 * descriptions; revisit with a proper editor library if requirements
 * grow (tables, embeds, collaborative editing, …).
 */
export function RichTextEditor({
  id,
  name,
  label,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLTextAreaElement>(null);

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    sync();
  }

  function sync() {
    if (editorRef.current && hiddenRef.current) {
      hiddenRef.current.value = editorRef.current.innerHTML;
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="rounded-lg border border-input">
        <div className="flex items-center gap-1 border-b border-input p-1.5">
          <ToolbarButton icon={Bold} label="Bold" onClick={() => exec("bold")} />
          <ToolbarButton icon={Italic} label="Italic" onClick={() => exec("italic")} />
          <ToolbarButton
            icon={List}
            label="Bullet list"
            onClick={() => exec("insertUnorderedList")}
          />
          <ToolbarButton
            icon={ListOrdered}
            label="Numbered list"
            onClick={() => exec("insertOrderedList")}
          />
          <ToolbarButton
            icon={LinkIcon}
            label="Link"
            onClick={() => {
              const url = window.prompt("Link URL");
              if (url) exec("createLink", url);
            }}
          />
        </div>
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          onBlur={sync}
          className="min-h-32 px-3 py-2 text-sm outline-none prose-sm [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: defaultValue ?? "" }}
        />
      </div>
      <textarea ref={hiddenRef} name={name} defaultValue={defaultValue ?? ""} className="hidden" />
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Icon className="size-4" />
    </Button>
  );
}
