import { supabase } from "./client";

export async function incrementViewCount(postId: string): Promise<void> {
  try {
    // Try atomic increment using RPC first
    const { error: rpcError } = await supabase.rpc("increment_post_views", {
      post_id: postId,
    });

    if (!rpcError) return;
  } catch (err) {
    console.warn("RPC increment failed, falling back to fetch-and-update", err);
  }

  // Fallback: Select and update
  const { data, error: selectError } = await supabase
    .from("posts")
    .select("view_count")
    .eq("id", postId)
    .single();

  if (selectError || !data) return;

  await supabase
    .from("posts")
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq("id", postId);
}
