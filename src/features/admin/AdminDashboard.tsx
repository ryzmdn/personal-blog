import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllPostsAdmin, deletePost, updatePost } from "../../services/supabase/posts";
import { getDashboardStats } from "../../services/supabase/analytics";
import { getNewsletterSubscribers } from "../../services/supabase/newsletter";
import { useAuth } from "../../contexts/AuthContext";
import {
  FileText,
  Eye,
  Users,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Lock,
  Loader2,
  AlertCircle,
  TrendingUp,
  Inbox,
  LogOut
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"posts" | "subscribers">("posts");

  // Fetch all posts for admin
  const {
    data: posts = [],
    isLoading: postsLoading,
    isError: postsError,
  } = useQuery({
    queryKey: ["posts", "admin"],
    queryFn: getAllPostsAdmin,
  });

  // Fetch stats metrics
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: getDashboardStats,
  });

  // Fetch newsletter subscribers
  const {
    data: subscribers = [],
    isLoading: subsLoading,
  } = useQuery({
    queryKey: ["subscribers"],
    queryFn: getNewsletterSubscribers,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  // Toggle Publish Mutation
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      updatePost(id, { published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus artikel "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePublish = (id: string, currentStatus: boolean) => {
    togglePublishMutation.mutate({ id, published: !currentStatus });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };
  return (
    <div className="space-y-8 py-4 animate-in fade-in duration-300">
      {/* Upper header action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight">Dashboard Admin</h1>
          <p className="text-sm text-muted-foreground">
            Kelola publikasi, lihat statistik performa, dan pantau newsletter Anda.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tulis Artikel
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary/40 text-destructive border-destructive/20 hover:border-destructive/40 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Posts Card */}
        <div className="rounded-xl border border-border/40 bg-card p-6 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Artikel</p>
            <p className="text-3xl font-black font-heading">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : stats?.totalPosts || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* Total Views Card */}
        <div className="rounded-xl border border-border/40 bg-card p-6 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Pembaca</p>
            <p className="text-3xl font-black font-heading flex items-center gap-2">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : stats?.totalViews || 0}
              {stats && stats.totalViews > 0 && (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              )}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Eye className="h-6 w-6" />
          </div>
        </div>

        {/* Total Subscribers Card */}
        <div className="rounded-xl border border-border/40 bg-card p-6 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subscriber Newsletter</p>
            <p className="text-3xl font-black font-heading">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : stats?.totalSubscribers || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/40 flex items-center gap-4">
        <button
          onClick={() => setActiveTab("posts")}
          className={`py-3 text-sm font-semibold border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === "posts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Daftar Artikel
        </button>
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`py-3 text-sm font-semibold border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === "subscribers"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Subscriber Newsletter ({subscribers.length})
        </button>
      </div>

      {/* Main Contents based on Active Tab */}
      {activeTab === "posts" ? (
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
          {postsLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Memuat daftar artikel...</p>
            </div>
          ) : postsError ? (
            <div className="p-8 text-center text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Gagal memuat artikel dari database.</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground space-y-4">
              <Inbox className="h-12 w-12 mx-auto opacity-30" />
              <p className="font-semibold text-lg">Belum ada artikel yang dibuat</p>
              <p className="text-sm">Klik "Tulis Artikel" di atas untuk membuat postingan pertama Anda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-secondary/20 font-semibold text-muted-foreground">
                    <th className="p-4">Judul Artikel</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Dibaca</th>
                    <th className="p-4">Dibuat Pada</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-4 font-semibold text-foreground max-w-xs md:max-w-md truncate">
                        <Link to={`/blog/${post.slug}`} className="hover:text-primary hover:underline">
                          {post.title}
                        </Link>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePublish(post.id, post.published)}
                          disabled={togglePublishMutation.isPending}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            post.published
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20"
                          }`}
                          title="Klik untuk mengubah status publikasi"
                        >
                          {post.published ? (
                            <>
                              <Globe className="h-3 w-3" />
                              Published
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              Draft
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4 font-mono text-muted-foreground">
                        {post.view_count} views
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          to={`/admin/edit/${post.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg border border-border/40 hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Artikel"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center justify-center p-2 rounded-lg border border-destructive/10 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          title="Hapus Artikel"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Subscribers Tab */
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
          {subsLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Memuat daftar subscriber...</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground space-y-4">
              <Inbox className="h-12 w-12 mx-auto opacity-30" />
              <p className="font-semibold text-lg">Belum ada subscriber</p>
              <p className="text-sm">Newsletter signup berada di bagian sidebar halaman beranda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-secondary/20 font-semibold text-muted-foreground">
                    <th className="p-4">No.</th>
                    <th className="p-4">Alamat Email</th>
                    <th className="p-4">Terdaftar Pada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {subscribers.map((sub, index) => (
                    <tr key={sub.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-4 font-mono text-muted-foreground">{index + 1}</td>
                      <td className="p-4 font-semibold">{sub.email}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
