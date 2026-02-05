"use client";

import { useState } from "react";
import { saveNote } from "../services/notesService";

export default function NoteEditor({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const [content, setContent] = useState("");

  const handleSave = async () => {
    await saveNote({
      article_title: title,
      article_slug: slug,
      content,
    });

    alert("Note saved");
  };

  return (
    <div>
      <h3>Your Notes</h3>
      <textarea
        placeholder="Write your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={handleSave}>Save Note</button>
    </div>
  );
}
