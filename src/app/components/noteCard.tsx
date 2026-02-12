"use client";

import { useState } from "react";
import { updateNote, deleteNote } from "../services/notesService";

interface Note {
  id: string;
  article_title: string;
  content: string;
}

export default function NoteCard({ note }: { note: Note }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);

  const handleUpdate = async () => {
    await updateNote(note.id, content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Delete this note?")) {
      await deleteNote(note.id);
      window.location.reload();
    }
  };

  return (
    <div className="border p-4 rounded mb-3">
      <h3 className="font-semibold">{note.article_title}</h3>

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
