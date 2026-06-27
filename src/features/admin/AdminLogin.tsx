import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../services/supabase/client";
import { Lock, Mail, Loader2, ArrowLeft, AlertCircle } from "lucide-react";

export const AdminLogin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect to admin dashboard
  useEffect(() => {
    if (user) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || "Gagal masuk. Periksa kembali email dan password.");
      setLoading(false);
    } else {
      navigate("/admin", { replace: true });
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-md bg-card border border-border/40 rounded-2xl p-8 space-y-6 shadow-xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-2">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-2xl font-black tracking-tight">Login Administrator</h1>
          <p className="text-sm text-muted-foreground">
            Masuk untuk menulis artikel baru dan mengelola blog Anda.
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-xs font-medium text-destructive items-start">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                disabled={loading}
                className="w-full rounded-lg border border-border/40 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full rounded-lg border border-border/40 bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all disabled:opacity-50 cursor-pointer shadow"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengecek Kredensial...
              </>
            ) : (
              "Masuk Sekarang"
            )}
          </button>
        </form>

        <div className="pt-2 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Info helper for setup */}
      <div className="mt-8 max-w-md text-center bg-secondary/20 border border-border/40 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed">
        <p className="font-semibold text-foreground mb-1">Catatan Pengaturan:</p>
        Kredensial login dikelola langsung melalui database Supabase Auth Anda. Silakan tambahkan pengguna baru di panel Supabase Dashboard &gt; Authentication &gt; Users.
      </div>
    </div>
  );
};
