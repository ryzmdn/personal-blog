import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug } from "../../services/supabase/posts";
import { getCommentsByPostId, addComment } from "../../services/supabase/comments";
import { incrementViewCount } from "../../services/supabase/views";
import {
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  Check,
  Send,
  MessageSquare,
  Copy,
  ChevronRight,
  BookOpen,
  Loader2
} from "lucide-react";

const TwitterIcon: React.FC = () => (
  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon: React.FC = () => (
  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

// Helper to get raw text from react-markdown headers
const getHeadingText = (children: React.ReactNode): string => {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return child;
      }
      return "";
    })
    .join("");
};

// Helper to slugify heading text
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const viewCounted = useRef(false);

  // Form states for comments
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");

  // Fetch post data
  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
    error: postErrDetails,
  } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPostBySlug(slug || ""),
    enabled: !!slug,
  });

  const postId = post?.id;

  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsByPostId(postId || ""),
    enabled: !!postId,
  });

  // Track post views (runs once per slug load)
  useEffect(() => {
    if (postId && !viewCounted.current) {
      viewCounted.current = true;
      incrementViewCount(postId).then(() => {
        // Invalidate posts list so view counts update
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      });
    }
  }, [postId, queryClient]);

  // Reset view tracker if slug changes
  useEffect(() => {
    viewCounted.current = false;
  }, [slug]);

  // Comment insertion mutation
  const commentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setCommentContent("");
      // Keep name and email in state for user convenience
    },
  });

  // Extract headings for Table of Contents (TOC)
  const getTOC = () => {
    if (!post?.content) return [];
    const lines = post.content.split("\n");
    const headings: { id: string; text: string; level: number }[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        headings.push({
          id: slugify(text),
          text,
          level,
        });
      }
    });
    return headings;
  };

  const toc = getTOC();

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId || !commentName.trim() || !commentContent.trim()) return;

    commentMutation.mutate({
      post_id: postId,
      user_name: commentName,
      user_email: commentEmail || undefined,
      content: commentContent,
    });
  };

  if (postLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Memuat artikel...</p>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-destructive">
          <p className="text-lg font-bold">Artikel Tidak Ditemukan</p>
          <p className="text-sm text-muted-foreground mt-2">
            {(postErrDetails as any)?.message || "Artikel yang Anda cari tidak tersedia."}
          </p>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-12">
      {/* Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Beranda
        </Link>

        {/* Share buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShareCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold hover:bg-secondary/40 transition-colors cursor-pointer"
            title="Salin Tautan"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Salin Link</span>
              </>
            )}
          </button>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg border border-border hover:bg-secondary/40 transition-colors flex items-center justify-center"
            title="Bagikan ke Twitter/X"
          >
            <TwitterIcon />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg border border-border hover:bg-secondary/40 transition-colors flex items-center justify-center"
            title="Bagikan ke LinkedIn"
          >
            <LinkedinIcon />
          </a>
        </div>
      </div>

      {/* Main Grid: Post Content vs Sidebar TOC */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
        {/* Post Container (3 cols) */}
        <div className="lg:col-span-3 space-y-8">
          {/* Metadata & Title */}
          <div className="space-y-4">
            <h1 className="font-heading text-3xl md:text-5xl font-black tracking-tight leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : new Date(post.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.reading_time} menit membaca
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.view_count} pembaca
              </span>
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border/40 bg-muted">
              <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
            </div>
          )}

          {/* Markdown Content Parser */}
          <article className="prose dark:prose-invert max-w-none prose-pre:bg-secondary/60 prose-pre:border prose-pre:border-border/40 prose-headings:font-heading prose-headings:tracking-tight prose-a:text-primary leading-relaxed space-y-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => {
                  const id = slugify(getHeadingText(children));
                  return (
                    <h2 id={id} className="scroll-mt-24 text-2xl md:text-3xl font-bold mt-10 mb-4 pb-2 border-b border-border/20">
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  const id = slugify(getHeadingText(children));
                  return (
                    <h3 id={id} className="scroll-mt-24 text-xl md:text-2xl font-bold mt-8 mb-3">
                      {children}
                    </h3>
                  );
                },
                p: ({ children }) => <p className="text-base md:text-lg text-muted-foreground/90 my-4 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-2 text-muted-foreground/90">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-2 text-muted-foreground/90">{children}</ol>,
                li: ({ children }) => <li className="text-base md:text-lg">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 py-1 italic bg-secondary/20 rounded-r-lg my-6 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                pre: ({ children }) => (
                  <pre className="p-4 rounded-xl overflow-x-auto bg-secondary/30 dark:bg-zinc-900 border border-border/40 font-mono text-sm my-6">
                    {children}
                  </pre>
                ),
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded bg-secondary/5 font-mono text-sm text-primary font-medium">
                    {children}
                  </code>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </article>

          <hr className="border-border/40 my-12" />

          {/* Comments Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-heading font-black tracking-tight">Komentar ({comments.length})</h2>
            </div>

            {/* List of comments */}
            <div className="space-y-4">
              {commentsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Memuat komentar...
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic bg-secondary/10 p-4 rounded-xl">
                  Belum ada komentar untuk artikel ini. Jadilah yang pertama memberikan respon!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-border/40 bg-secondary/5 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{comment.user_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add comment Form */}
            <form onSubmit={handleCommentSubmit} className="rounded-xl border border-border/40 p-6 space-y-4 bg-card">
              <h3 className="font-heading font-bold text-lg">Tulis Komentar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="commentName" className="text-xs font-semibold text-muted-foreground">
                    Nama Anda *
                  </label>
                  <input
                    id="commentName"
                    type="text"
                    required
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="Nama lengkap/panggilan"
                    className="w-full rounded-lg border border-border/40 bg-background px-4 py-2 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="commentEmail" className="text-xs font-semibold text-muted-foreground">
                    Email (Opsional, tidak akan dipublikasikan)
                  </label>
                  <input
                    id="commentEmail"
                    type="email"
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-lg border border-border/40 bg-background px-4 py-2 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="commentContent" className="text-xs font-semibold text-muted-foreground">
                  Komentar *
                </label>
                <textarea
                  id="commentContent"
                  required
                  rows={4}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Komentar Anda..."
                  className="w-full rounded-lg border border-border/40 bg-background px-4 py-2 text-sm outline-none focus:border-primary transition-colors resize-y"
                />
              </div>
              <button
                type="submit"
                disabled={commentMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {commentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Kirim Komentar
                  </>
                )}
              </button>
            </form>
          </section>
        </div>

        {/* Sidebar Panel - TOC & sticky utilities (1 col) */}
        {toc.length > 0 && (
          <aside className="hidden lg:block lg:sticky lg:top-24 space-y-8 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
            <div className="space-y-4">
              <h3 className="text-xs font-black tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Daftar Isi
              </h3>
              <nav className="space-y-1 border-l border-border/40">
                {toc.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`block py-1.5 text-sm font-medium transition-colors hover:text-primary ${
                      heading.level === 2 ? "pl-4 text-muted-foreground" : "pl-8 text-muted-foreground/70"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />
                      <span className="truncate">{heading.text}</span>
                    </div>
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
