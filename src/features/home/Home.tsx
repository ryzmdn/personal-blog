import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { getPosts } from "../../services/supabase/posts";
import { subscribeToNewsletter } from "../../services/supabase/newsletter";
import { Calendar, Clock, Eye, Sparkles, Loader2, ArrowRight, Mail, BookOpen } from "lucide-react";

export const Home: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // TanStack Query for Infinite Posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["posts", "public"],
    queryFn: ({ pageParam = 0 }) => getPosts({ pageParam, limit: 6, onlyPublished: true }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  // Mutation for Newsletter Signup
  const newsletterMutation = useMutation({
    mutationFn: subscribeToNewsletter,
    onSuccess: () => {
      setSubscribeStatus({
        type: "success",
        message: "Terima kasih! Anda berhasil berlangganan newsletter.",
      });
      setEmail("");
    },
    onError: (err: any) => {
      setSubscribeStatus({
        type: "error",
        message: err.message || "Gagal berlangganan. Silakan coba lagi.",
      });
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus({ type: null, message: "" });
    newsletterMutation.mutate(email);
  };

  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-radial-[at_top_right,_var(--color-secondary)_0%,_transparent_60%] px-6 py-16 md:px-12 md:py-24 text-center md:text-left">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary animate-bounce">
            <Sparkles className="h-3 w-3" />
            Selamat Datang di Blog Saya
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight leading-none">
            Menulis tentang <span className="bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text text-transparent">Teknologi</span>, Kode, dan Kreativitas.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Halo! Saya Rizky, seorang Frontend Architect. Di sini saya menulis ulasan mendalam tentang rekayasa perangkat lunak modern, arsitektur web, dan ekosistem React.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <a
              href="#posts"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md cursor-pointer"
            >
              Baca Artikel
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary/40 transition-all cursor-pointer"
            >
              Tentang Saya
            </a>
          </div>
        </div>
      </section>

      {/* Main Blog & Sidebar Grid */}
      <div id="posts" className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Posts Area (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-3xl font-heading font-black tracking-tight border-b border-border/40 pb-3">
            Artikel Terbaru
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Memuat artikel...</p>
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="text-sm text-muted-foreground">{(error as any)?.message || "Gagal memuat artikel."}</p>
            </div>
          ) : allPosts.length === 0 ? (
            <div className="rounded-xl border border-border border-dashed p-12 text-center text-muted-foreground">
              <p className="font-semibold">Belum Ada Artikel</p>
              <p className="text-sm">Silakan buat artikel baru dari dashboard admin.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
                          <BookOpen className="h-8 w-8 opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-5 space-y-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : new Date(post.created_at).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.reading_time} mnt
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {post.view_count} views
                        </span>
                      </div>

                      <h3 className="font-heading text-xl font-bold tracking-tight leading-tight group-hover:text-primary transition-colors">
                        <Link to={`/blog/${post.slug}`} className="focus:outline-none">
                          <span className="absolute inset-0" aria-hidden="true" />
                          {post.title}
                        </Link>
                      </h3>

                      <p className="line-clamp-2 text-sm text-muted-foreground flex-grow leading-relaxed">
                        {post.excerpt || "Tidak ada ringkasan tersedia."}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More Button */}
              {hasNextPage && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-semibold hover:bg-secondary/40 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memuat...
                      </>
                    ) : (
                      "Muat Lebih Banyak"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Panel (1 col) */}
        <div className="space-y-12">
          {/* About Panel */}
          <section id="about" className="rounded-2xl border border-border/40 bg-secondary/20 p-6 space-y-4">
            <h3 className="text-xl font-heading font-black tracking-tight">Tentang Saya</h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Saya adalah <strong>Rizky</strong>, seorang Senior Frontend Architect. Spesialisasi saya meliputi pembuatan aplikasi web modern yang cepat, berskala besar, serta ramah pengguna.
              </p>
              <p>
                Melalui tulisan-tulisan di blog ini, saya berbagi pengetahuan praktis mengenai pengembangan web dengan fokus pada ekosistem JavaScript/TypeScript, React, performance optimization, dan arsitektur frontend.
              </p>
            </div>
          </section>

          {/* Newsletter Panel */}
          <section className="rounded-2xl border border-border/40 bg-primary/5 p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Mail className="h-5 w-5" />
              <h3 className="text-xl font-heading font-black tracking-tight">Langganan Newsletter</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dapatkan email notifikasi setiap kali artikel baru diterbitkan. Tanpa spam, Anda dapat berhenti berlangganan kapan saja.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                placeholder="Alamat email Anda..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={newsletterMutation.isPending}
                className="w-full rounded-lg border border-border/40 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={newsletterMutation.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {newsletterMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Berlangganan"
                )}
              </button>
            </form>

            {subscribeStatus.type && (
              <p
                className={`text-xs mt-2 font-medium ${
                  subscribeStatus.type === "success" ? "text-emerald-500" : "text-destructive"
                }`}
              >
                {subscribeStatus.message}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
