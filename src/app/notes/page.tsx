import NoteCard from "../components/noteCard";
import { getUserNotes } from "../services/notesService";

export default async function NotesPage() {
  const { data: notes } = await getUserNotes();

  return (
    <div>
      <h1>Your Notes</h1>
      {notes?.length === 0 && <p>No notes yet.</p>}

      {notes?.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}