import { supabase } from "./client";
import type { DashboardStats } from "../../types";

export async function getDashboardStats(): Promise<DashboardStats> {
  // Fetch posts count & views count sum
  const { data: postsData, error: postsError, count: totalPosts } = await supabase
    .from("posts")
    .select("view_count", { count: "exact" });

  if (postsError) {
    throw new Error(postsError.message);
  }

  const totalViews = postsData?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;

  // Fetch subscribers count
  const { count: totalSubscribers, error: subError } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true });

  if (subError) {
    throw new Error(subError.message);
  }

  return {
    totalPosts: totalPosts || 0,
    totalViews,
    totalSubscribers: totalSubscribers || 0,
  };
}
