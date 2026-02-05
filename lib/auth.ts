import { supabase } from "./superbaseClient";

export async function getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
}
