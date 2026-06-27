import { supabase } from "./client";
import type { NewsletterSubscriber } from "../../types";

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

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as NewsletterSubscriber[]) || [];
}

