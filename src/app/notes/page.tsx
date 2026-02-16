"use client";

import { useEffect, useState } from "react";
import NoteCard from "../components/noteCard";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadNotes = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await getUserNotes();

        if (!isMounted) return;

        if (fetchError) {
          setError(fetchError.message);
          setNotes([]);
        } else {
          setError(null);
          setNotes((data as Note[]) ?? []);
        }
      } catch (loadError) {
        if (!isMounted) return;
        const message =
          loadError instanceof Error ? loadError.message : "Unexpected error";
        setError(message);
        setNotes([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadNotes();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <div className="p-6">Loading notes...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Unable to load notes: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Your Notes</h1>
      {notes.length === 0 && <p>No notes yet.</p>}

      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onDeleted={(id) => setNotes((prev) => prev.filter((item) => item.id !== id))}
          onUpdated={(id, content) =>
            setNotes((prev) =>
              prev.map((item) => (item.id === id ? { ...item, content } : item)),
            )
          }
        />
      ))}
    </div>
  );
}
