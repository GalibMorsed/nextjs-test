"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NoteCard from "./noteCard";
import { getUserNotes } from "../services/notesService";

interface Note {
  id: string;
  article_title: string;
  article_url?: string;
  article_date?: string;
  source_name?: string;
  content: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const { data, error: fetchError } = await getUserNotes();

      if (fetchError) {
        setError(fetchError.message);
        setNotes([]);
      } else {
        setError(null);
        setNotes((data as Note[]) ?? []);
      }
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Unexpected error";
      setError(message);
      setNotes([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const sortedNotes = useMemo(
    () =>
      [...notes].sort((a, b) => {
        const dateA = a.article_date ? new Date(a.article_date).getTime() : 0;
        const dateB = b.article_date ? new Date(b.article_date).getTime() : 0;
        return dateB - dateA;
      }),
    [notes],
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-pulse space-y-5">
          <div className="h-28 rounded-3xl bg-white" />
          <div className="h-40 rounded-2xl bg-white" />
          <div className="h-40 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e2e8f0,_#f8fafc_55%,_#ffffff)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur transition hover:shadow-md sm:p-8">
          {/* subtle animated background */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/40 to-purple-50/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Saved Notes
              </span>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Your Notes
              </h1>

              <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
                All your article highlights, summaries, and thoughts — neatly
                organized and always accessible.
              </p>
            </div>

            {/* count card */}
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-center transition hover:scale-[1.03]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Notes
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {notes.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">Unable to load notes</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              type="button"
              onClick={() => void loadNotes(true)}
              className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              Try Again
            </button>
          </section>
        ) : null}

        {!error && sortedNotes.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              No notes yet
            </h2>
            <p className="mt-2 text-slate-600">
              Save notes from any article and they will appear here.
            </p>
          </section>
        ) : null}

        {sortedNotes.length > 0 ? (
          <section className="grid gap-4">
            {sortedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDeleted={(id) =>
                  setNotes((prev) => prev.filter((item) => item.id !== id))
                }
                onUpdated={(id, content) =>
                  setNotes((prev) =>
                    prev.map((item) =>
                      item.id === id ? { ...item, content } : item,
                    ),
                  )
                }
              />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
