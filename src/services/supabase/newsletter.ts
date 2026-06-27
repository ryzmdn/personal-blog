import { supabase } from "./client";

export async function subscribeToNewsletter(email: string): Promise<void> {
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert([{ email }]);

  if (error) {
    // If user is already subscribed, handle it gracefully
    if (error.code === "23505") {
      throw new Error("Email ini sudah terdaftar dalam newsletter.");
    }
    throw new Error(error.message);
  }
}
