"use client";

import { useState } from "react";
import { updateNote, deleteNote } from "../services/notesService";

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
  const [content, setContent] = useState(note.content);

  const handleUpdate = async () => {
    const { error } = await updateNote(note.id, content);
    if (error) return;

    onUpdated?.(note.id, content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Delete this note?")) {
      const { error } = await deleteNote(note.id);
      if (error) return;

      onDeleted?.(note.id);
    }
  };

  return (
    <div className="border p-4 rounded mb-3">
      <h3 className="font-semibold">{note.article_title}</h3>
      <p className="text-xs text-gray-500 mt-1">
        {note.article_date
          ? new Date(note.article_date).toLocaleString()
          : "Date Not Available"}
      </p>
      {note.source_name && (
        <p className="text-xs text-gray-500">Source: {note.source_name}</p>
      )}
      {note.article_url && (
        <a
          href={note.article_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline break-all"
        >
          {note.article_url}
        </a>
      )}

      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      ) : (
        <p>{note.content}</p>
      )}

      <div className="flex gap-2 mt-2">
        {isEditing ? (
          <button onClick={handleUpdate}>Save</button>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit</button>
        )}

        <button onClick={handleDelete} className="text-red-500">
          Delete
        </button>
      </div>
    </div>
  );
}
