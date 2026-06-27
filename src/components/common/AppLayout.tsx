import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { Sun, Moon, BookOpen, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";

export const AppLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: "Beranda", path: "/" },
    { name: "Tentang Saya", path: "/#about" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight text-primary">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>RyzMdn<span className="text-muted-foreground font-light">.blog</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5 ${
                    isActive("/admin") ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5 ${
                  isActive("/admin/login") ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                <User className="h-4 w-4" />
                Login Admin
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary border border-border/40 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary border border-border/40 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-secondary border border-border/40 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur-md px-4 py-4 animate-in fade-in slide-in-from-top-5 duration-200">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors ${
                    isActive(link.path) ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <hr className="border-border/40 my-1" />

              {user ? (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-muted-foreground hover:text-primary flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard Admin
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-base font-medium text-muted-foreground hover:text-destructive flex items-center gap-2 cursor-pointer text-left w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-muted-foreground hover:text-primary flex items-center gap-2"
                >
                  <User className="h-5 w-5" />
                  Login Admin
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 md:px-8 py-8 max-w-7xl animate-in fade-in duration-300">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 bg-secondary/30 mt-auto py-8">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} RyzMdn Blog. Built with Vite, React, Tailwind CSS, & Supabase.
            </p>
          </div>
          <div className="flex gap-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              GitHub
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Twitter
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
