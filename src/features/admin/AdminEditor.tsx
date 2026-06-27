import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostById, createPost, updatePost } from "../../services/supabase/posts";
import {
  ArrowLeft,
  Save,
  Eye,
  Edit3,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Sparkles
} from "lucide-react";

// Helper to slugify title
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const AdminEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Editor states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  // Behavior states
  const [autoSlug, setAutoSlug] = useState(!isEditMode);
  const [activeMode, setActiveMode] = useState<"edit" | "preview">("edit");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch post data if in edit mode
  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
  } = useQuery({
    queryKey: ["post", "admin", id],
    queryFn: () => getPostById(id || ""),
    enabled: isEditMode,
  });

  // Populate form states once data is fetched
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt || "");
      setCoverImageUrl(post.cover_image_url || "");
      setContent(post.content);
      setPublished(post.published);
      setAutoSlug(false); // Do not overwrite slug automatically in edit mode
    }
  }, [post]);

  // Handle auto slugging
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (autoSlug) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(slugify(e.target.value));
    setAutoSlug(false); // Stop auto-updating since user edited slug manually
  };

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: async () => {
      const postData = {
        title,
        slug,
        excerpt: excerpt || undefined,
        cover_image_url: coverImageUrl || undefined,
        content,
        published,
      };

      if (isEditMode) {
        return updatePost(id || "", postData);
      } else {
        return createPost(postData);
      }
    },
    onSuccess: () => {
      navigate("/admin", { replace: true });
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Gagal menyimpan artikel.");
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Judul artikel tidak boleh kosong.");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Slug artikel tidak boleh kosong.");
      return;
    }
    if (!content.trim()) {
      setErrorMessage("Konten artikel tidak boleh kosong.");
      return;
    }

    saveMutation.mutate();
  };

  if (isEditMode && postLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat data artikel...</p>
      </div>
    );
  }

  if (isEditMode && postError) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-destructive">
          <p className="text-lg font-bold">Artikel Gagal Dimuat</p>
          <p className="text-sm text-muted-foreground mt-2">
            ID artikel tidak valid atau terjadi kesalahan pada database.
          </p>
        </div>
        <Link to="/admin" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4 animate-in fade-in duration-300">
      {/* Back button and page status header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="p-2 rounded-lg border border-border hover:bg-secondary/40 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-black tracking-tight">
              {isEditMode ? "Edit Artikel" : "Tulis Artikel Baru"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Format tulisan didukung oleh Markdown standard.
            </p>
          </div>
        </div>

        {/* Save button trigger */}
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Simpan Postingan
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive items-start max-w-4xl mx-auto">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Editor & Preview Workspace Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Inputs (Left Side - 2/3 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* Metadata Section */}
          <div className="bg-card border border-border/40 rounded-xl p-6 space-y-4 shadow-sm">
            <h2 className="font-heading text-lg font-bold flex items-center gap-2 border-b border-border/20 pb-2">
              <FileText className="h-5 w-5 text-primary" />
              Metadata Artikel
            </h2>

            {/* Title field */}
            <div className="space-y-1.5">
              <label htmlFor="postTitle" className="text-xs font-semibold text-muted-foreground">
                Judul Artikel *
              </label>
              <input
                id="postTitle"
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="Masukkan judul postingan..."
                className="w-full rounded-lg border border-border/40 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors text-base font-semibold"
              />
            </div>

            {/* Slug field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="postSlug" className="text-xs font-semibold text-muted-foreground">
                  Slug Artikel * (Unique URL path)
                </label>
                <label className="flex items-center gap-1 text-xs text-muted-foreground select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSlug}
                    onChange={(e) => setAutoSlug(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-0"
                  />
                  <span>Generate Otomatis</span>
                </label>
              </div>
              <input
                id="postSlug"
                type="text"
                required
                value={slug}
                onChange={handleSlugChange}
                placeholder="judul-artikel-baru"
                className="w-full rounded-lg border border-border/40 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors font-mono"
              />
            </div>

            {/* Cover Image field */}
            <div className="space-y-1.5">
              <label htmlFor="postCover" className="text-xs font-semibold text-muted-foreground">
                URL Gambar Sampul (Cover Image)
              </label>
              <input
                id="postCover"
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-lg border border-border/40 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors text-xs font-mono"
              />
            </div>

            {/* Excerpt field */}
            <div className="space-y-1.5">
              <label htmlFor="postExcerpt" className="text-xs font-semibold text-muted-foreground">
                Ringkasan Singkat (Excerpt)
              </label>
              <textarea
                id="postExcerpt"
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan pendek artikel untuk card beranda..."
                className="w-full rounded-lg border border-border/40 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Publish Toggle */}
            <div className="pt-2 flex items-center justify-between border-t border-border/20 mt-4">
              <span className="text-sm font-semibold text-muted-foreground">
                Status Publikasi
              </span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-3 text-sm font-bold text-foreground">
                  {published ? "Published (Publik)" : "Draft (Privat)"}
                </span>
              </label>
            </div>
          </div>

          {/* Markdown Content area */}
          <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
            {/* Mode Switch Tab Bar */}
            <div className="border-b border-border/40 bg-secondary/10 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                KONTEN ARTIKEL (MARKDOWN)
              </span>
              <div className="flex items-center bg-background border border-border/60 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveMode("edit")}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                    activeMode === "edit"
                      ? "bg-secondary text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Tulis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode("preview")}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                    activeMode === "preview"
                      ? "bg-secondary text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Pratinjau
                </button>
              </div>
            </div>

            {/* Tab contents */}
            <div className="flex-1 flex flex-col p-4 bg-background">
              {activeMode === "edit" ? (
                <textarea
                  required
                  rows={20}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Judul Utama Postingan Anda&#10;&#10;Tuliskan isi konten menggunakan format Markdown di sini. Anda dapat menggunakan heading `## Subjudul`, text block, bullet points, ataupun code blocks."
                  className="w-full flex-grow p-4 bg-background border border-border/20 outline-none rounded-lg font-mono text-sm leading-relaxed resize-y focus:border-primary/50 min-h-[400px]"
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none p-4 min-h-[400px] border border-border/20 rounded-lg bg-secondary/5 overflow-y-auto leading-relaxed">
                  {content.trim() === "" ? (
                    <p className="text-muted-foreground italic text-sm">Tidak ada konten untuk dipratinjau.</p>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3 border-b border-border/20 pb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xl font-bold mt-5 mb-2">{children}</h3>,
                        p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed my-3">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-6 my-3 text-sm text-muted-foreground space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-6 my-3 text-sm text-muted-foreground space-y-1">{children}</ol>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary pl-4 py-1 italic bg-secondary/10 rounded my-4 text-muted-foreground">
                            {children}
                          </blockquote>
                        ),
                        pre: ({ children }) => (
                          <pre className="p-3 rounded bg-secondary/30 border border-border/40 font-mono text-xs my-4 overflow-x-auto">
                            {children}
                          </pre>
                        ),
                        code: ({ children }) => <code className="px-1 py-0.5 rounded bg-secondary/40 font-mono text-xs text-primary">{children}</code>,
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Markdown Cheatsheet (Right Side - 1/3 cols) */}
        <aside className="space-y-6">
          <div className="bg-card border border-border/40 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-sm text-primary flex items-center gap-1.5 border-b border-border/20 pb-2">
              <CheckCircle className="h-4 w-4" />
              Panduan Menulis Markdown
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div>
                <p className="font-bold text-foreground">Header</p>
                <code className="block bg-secondary/30 p-1.5 rounded font-mono mt-1">## Ini Heading 2<br />### Ini Heading 3</code>
              </div>
              <div>
                <p className="font-bold text-foreground">Penebalan & Miring</p>
                <code className="block bg-secondary/30 p-1.5 rounded font-mono mt-1">**Tebal** atau *Miring*</code>
              </div>
              <div>
                <p className="font-bold text-foreground">Daftar (List)</p>
                <code className="block bg-secondary/30 p-1.5 rounded font-mono mt-1">- Item Satu<br />- Item Dua</code>
              </div>
              <div>
                <p className="font-bold text-foreground">Blockquote</p>
                <code className="block bg-secondary/30 p-1.5 rounded font-mono mt-1">&gt; Ini kutipan penting.</code>
              </div>
              <div>
                <p className="font-bold text-foreground">Format Code</p>
                <code className="block bg-secondary/30 p-1.5 rounded font-mono mt-1">`inline code` atau blok:<br />```js<br />const a = 10;<br />```</code>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
