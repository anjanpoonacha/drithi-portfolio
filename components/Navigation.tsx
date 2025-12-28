"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, BookOpen, Music, Home } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/music", label: "Music", icon: Music },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // Handle scroll effect for enhanced backdrop
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "backdrop-blur-xl bg-white/80 shadow-lg"
          : "backdrop-blur-md bg-white/60 shadow-md"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-primary)] rounded-lg px-2 py-1"
            aria-label="Home - Drithi Sparkle"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles
                className="w-6 h-6 md:w-8 md:h-8"
                style={{ color: "var(--pink-accent)" }}
              />
            </motion.div>
            <h1
              className="sparkle-text text-2xl md:text-3xl font-bold"
              style={{ fontFamily: "'Pacifico', cursive" }}
            >
              Drithi Sparkle
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-primary)]",
                    "flex items-center gap-2",
                    "text-purple-900",
                    active
                      ? "font-semibold"
                      : "opacity-70 hover:opacity-100"
                  )}
                  aria-label={link.label}
                  aria-current={active ? "page" : undefined}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </motion.div>

                  {/* Active indicator with purple glow */}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: "linear-gradient(135deg, rgba(155, 89, 182, 0.1), rgba(255, 105, 180, 0.1))",
                        boxShadow: "0 0 20px rgba(155, 89, 182, 0.4), 0 0 40px rgba(255, 105, 180, 0.2)",
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 rounded-lg transition-colors hover:bg-[var(--purple-primary)]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-primary)]"
                  aria-label="Toggle menu"
                  aria-expanded={isOpen}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X
                          className="w-6 h-6"
                          style={{ color: "var(--purple-primary)" }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu
                          className="w-6 h-6"
                          style={{ color: "var(--purple-primary)" }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[280px] sm:w-[320px] bg-gradient-to-br from-[var(--bg-soft)] to-white/95 backdrop-blur-xl border-l-2 border-[var(--purple-primary)]/20"
              >
                {/* Accessible title for screen readers */}
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                {/* Cherry Blossom Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="8" fill="var(--pink-accent)" />
                    <ellipse cx="50" cy="30" rx="12" ry="20" fill="var(--pink-light)" opacity="0.8" />
                    <ellipse cx="70" cy="50" rx="20" ry="12" fill="var(--pink-light)" opacity="0.8" />
                    <ellipse cx="50" cy="70" rx="12" ry="20" fill="var(--pink-light)" opacity="0.8" />
                    <ellipse cx="30" cy="50" rx="20" ry="12" fill="var(--pink-light)" opacity="0.8" />
                    <ellipse cx="65" cy="35" rx="15" ry="10" fill="var(--purple-primary)" opacity="0.6" transform="rotate(45 65 35)" />
                  </svg>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-2 mt-8" aria-label="Mobile navigation">
                  {navLinks.map((link, index) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);

                    return (
                      <motion.div
                        key={link.href}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-primary)]",
                            active
                              ? "bg-gradient-to-r from-[var(--purple-primary)]/20 to-[var(--pink-accent)]/20 font-semibold shadow-lg"
                              : "hover:bg-[var(--purple-primary)]/10 opacity-70 hover:opacity-100"
                          )}
                          aria-label={link.label}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{
                              color: active
                                ? "var(--purple-primary)"
                                : "var(--purple-dark)",
                            }}
                          />
                          <span className="text-lg">{link.label}</span>

                          {active && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto"
                            >
                              <Sparkles
                                className="w-4 h-4"
                                style={{ color: "var(--pink-accent)" }}
                              />
                            </motion.div>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Decorative Bottom Text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-8 left-0 right-0 text-center"
                >
                  <p
                    className="text-sm sparkle-text font-medium"
                    style={{ fontFamily: "'Pacifico', cursive" }}
                  >
                    Welcome to my world!
                  </p>
                </motion.div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
