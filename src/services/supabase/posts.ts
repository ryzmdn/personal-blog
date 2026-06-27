import { supabase } from "./client";
import type { Post } from "../../types";

const ESTIMATED_WPM = 200; // Words per minute average reading speed

export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / ESTIMATED_WPM));
}

export async function getPosts({
  pageParam = 0,
  limit = 5,
  onlyPublished = true,
}: {
  pageParam?: number;
  limit?: number;
  onlyPublished?: boolean;
}) {
  const from = pageParam * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("posts")
    .select("*", { count: "exact" });

  if (onlyPublished) {
    query = query.eq("published", true);
  }

  // Order by published_at or created_at descending
  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const posts = (data as Post[]) || [];
  const hasNextPage = from + posts.length < (count || 0);

  return {
    posts,
    nextPage: hasNextPage ? pageParam + 1 : undefined,
    totalCount: count || 0,
  };
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Post;
}

export async function createPost(
  post: Omit<Post, "id" | "created_at" | "updated_at" | "view_count" | "reading_time">
): Promise<Post> {
  const readingTime = calculateReadingTime(post.content);
  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        ...post,
        reading_time: readingTime,
        published_at: post.published ? new Date().toISOString() : null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Post;
}

export async function updatePost(
  id: string,
  post: Partial<Omit<Post, "id" | "created_at" | "updated_at">>
): Promise<Post> {
  const updates: any = { ...post };

  if (post.content !== undefined) {
    updates.reading_time = calculateReadingTime(post.content);
  }

  if (post.published !== undefined) {
    updates.published_at = post.published ? new Date().toISOString() : null;
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Post;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}
