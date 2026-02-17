"use client";

import { useState } from "react";
import { updateNote, deleteNote } from "../services/notesService";
import { ArrowUpRight } from "lucide-react";

interface Note {
  id: string;
  article_title: string;
  article_url?: string;
  article_date?: string;
  source_name?: string;
  content: string;
}

export default function NoteCard({
  note,
  onDeleted,
  onUpdated,
}: {
  note: Note;
  onDeleted?: (id: string) => void;
  onUpdated?: (id: string, content: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [content, setContent] = useState(note.content);

  const handleUpdate = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    setIsSaving(true);
    const { error } = await updateNote(note.id, trimmedContent);
    setIsSaving(false);

    if (error) return;

    setContent(trimmedContent);
    onUpdated?.(note.id, trimmedContent);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this note?")) return;

    setIsDeleting(true);
    const { error } = await deleteNote(note.id);
    setIsDeleting(false);

    if (error) return;

    onDeleted?.(note.id);
  };

  const formattedDate = note.article_date
    ? new Date(note.article_date).toLocaleString()
    : "Date not available";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="max-w-3xl text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
          {note.article_title}
        </h3>
        {note.source_name ? (
          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
            {note.source_name}
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {formattedDate}
      </p>

      {note.article_url ? (
        <a
          href={note.article_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
        >
          Open article
          <ArrowUpRight className="h-4 w-4" />
        </a>
      ) : null}

      {isEditing ? (
        <div className="mt-4">
          <label htmlFor={`note-${note.id}`} className="sr-only">
            Edit note content
          </label>
          <textarea
            id={`note-${note.id}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      ) : (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {note.content}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isSaving || isDeleting || !content.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setContent(note.content);
                setIsEditing(false);
              }}
              disabled={isSaving || isDeleting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={isDeleting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Edit
          </button>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isSaving}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}
