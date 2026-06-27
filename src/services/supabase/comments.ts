import { supabase } from "./client";
import type { Comment } from "../../types";

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as Comment[]) || [];
}

export async function addComment(
  comment: Omit<Comment, "id" | "created_at" | "approved">
): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        post_id: comment.post_id,
        user_name: comment.user_name,
        user_email: comment.user_email,
        content: comment.content,
        approved: true, // Default to true for ease of use in demo. Can be set to false for moderation.
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Comment;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}
