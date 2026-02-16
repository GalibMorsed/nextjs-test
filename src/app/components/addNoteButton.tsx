"use client";

import { useMemo, useState } from "react";
import { saveNote } from "../services/notesService";

interface AddNoteButtonProps {
  title: string;
  link: string;
  publishedAt?: string;
  sourceName?: string;
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function AddNoteButton({
  title,
  link,
  publishedAt,
  sourceName,
}: AddNoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const formattedDate = useMemo(() => {
    if (!publishedAt) return "Date Not Available";
    const parsed = new Date(publishedAt);
    if (Number.isNaN(parsed.getTime())) return "Date Not Available";
    return parsed.toLocaleString();
  }, [publishedAt]);

  const handleSave = async () => {
    if (!content.trim()) {
      setMessage("Please write something before saving.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const { error } = await saveNote({
        article_title: title,
        article_slug: toSlug(title),
        article_url: link,
        article_date: publishedAt ?? "",
        source_name: sourceName ?? "",
        content: content.trim(),
      });

      if (error) {
        setMessage(`Unable to save note: ${error.message}`);
        setIsSaving(false);
        return;
      }

      setMessage("Note saved.");
      setContent("");
      setIsSaving(false);
      setIsOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to save note.";
      setMessage(errorMessage);
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setMessage("");
        }}
        className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
      >
        + Add Notes
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Article Notepad</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="mb-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              <p>
                <span className="font-semibold">Headline:</span> {title}
              </p>
              <p>
                <span className="font-semibold">Date:</span> {formattedDate}
              </p>
              <p>
                <span className="font-semibold">Source:</span>{" "}
                {sourceName || "Unknown Source"}
              </p>
              <p className="break-all">
                <span className="font-semibold">Original Link:</span> {link}
              </p>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your notes here..."
              className="h-40 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
