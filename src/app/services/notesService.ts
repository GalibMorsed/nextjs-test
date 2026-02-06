import { supabase } from "../../../lib/superbaseClient";

export async function saveNote(note: {
    article_title: string;
    article_slug: string;
    content: string;
}) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not logged in");

    return supabase.from("notes").insert({
        user_id: userData.user.id,
        ...note,
    });
}

export async function getUserNotes() {
    return supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });
}

export async function updateNote(id: string, content: string) {
    return supabase
        .from("notes")
        .update({ content })
        .eq("id", id);
}

export async function deleteNote(id: string) {
    return supabase
        .from("notes")
        .delete()
        .eq("id", id);
}