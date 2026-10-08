"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Phone, Menu, X, Compass, ShieldCheck } from "lucide-react";
import { useSiteSettings } from "@/context/SettingsContext";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useSiteSettings();

  const primaryPhone = settings.contact_phone?.split("/")[0]?.trim() || "+91 800-PAVILION";
  const phoneTel = "tel:" + (primaryPhone.replace(/[^0-9+]/g, "") || "+918007284546");

  // If in admin panel, Navbar is handled by admin layout
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isAdmin) return null;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: "Cities", href: "/locations" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-950/90 backdrop-blur-md shadow-lg border-b border-slate-800/80 py-3.5"
          : "bg-gradient-to-b from-slate-950/90 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo2.png"
              alt="Pavilion 360"
              className="h-11 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-xl font-bold tracking-wider text-white font-serif flex items-center gap-1.5">
                PAVILION <span className="text-amber-400 text-xl tracking-widest font-sans font-light">360</span>
              </span>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase -mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400 inline" /> RERA Verified Advisory
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    active
                      ? "text-amber-400 font-semibold"
                      : "text-slate-200 hover:text-amber-300"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden lg:flex items-center gap-5">
            <a
              href={phoneTel}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-slate-900/80 px-3.5 py-2 rounded-full border border-slate-800"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{primaryPhone}</span>
            </a>
            <Link
              href="/contact"
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 hover:brightness-110 font-semibold text-xs tracking-wide px-5 py-2.5 rounded-full shadow-md shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:-translate-y-0.5"
            >
              Consult an Expert
            </Link>
            <Link
              href="/admin/login"
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors pl-2 border-l border-slate-800"
              title="Admin Portal"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg bg-slate-900/80 border border-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-6 py-6 transition-all animate-fadeIn">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base py-2 font-medium transition-colors ${
                  pathname === link.href ? "text-amber-400 font-semibold" : "text-slate-200"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
              <a
                href={phoneTel}
                className="flex items-center justify-center gap-2 text-sm text-slate-300 py-2.5 rounded-lg bg-slate-900 border border-slate-800"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call {primaryPhone}</span>
              </a>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-sm py-3 rounded-lg shadow-md"
              >
                Schedule Free Site Visit
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs text-slate-400 py-2"
              >
                Admin Portal Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
