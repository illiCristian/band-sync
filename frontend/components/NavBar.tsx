"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Mic2, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const { isAuthenticated, logout } = useAuth();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border transition-colors">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-primary rounded-xl text-primary-foreground group-hover:scale-110 transition-transform shadow-lg shadow-primary/25">
                        <Mic2 size={24} />
                    </div>
                    <span className="text-2xl font-black text-foreground tracking-tighter">
                        LosMapes
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-8 items-center">
                    <Link
                        href="/"
                        className={`text-sm font-bold transition-colors ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                    >
                        Inicio
                    </Link>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-foreground">Hola, Admin</span>
                            <Link
                                href="/admin"
                                className={`transition-all active:scale-95 px-5 py-2.5 text-sm font-black rounded-full shadow-lg transition-all ${isActive('/admin')
                                    ? 'bg-primary text-primary-foreground shadow-primary/25'
                                    : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                            >
                                Panel Admin
                            </Link>
                            <button
                                onClick={logout}
                                className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                            >
                                Salir
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                        >
                            Login
                        </Link>
                    )}

                    <ThemeToggle />
                </div>

                {/* Mobile Menu Button Container */}
                <div className="flex items-center gap-4 md:hidden">
                    <ThemeToggle />
                    <button
                        className="p-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Abrir menú"
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-background border-b border-border px-6 py-4 animate-in slide-in-from-top-4 duration-200">
                    {isActive('/admin') ? (
                        <Link
                            href="/"
                            onClick={() => setIsMenuOpen(false)}
                            className="px-5 py-3 text-center font-black rounded-xl transition-all shadow-lg bg-secondary text-secondary-foreground hover:bg-muted active:scale-95 block"
                        >
                            ← Volver al Inicio
                        </Link>
                    ) : (
                        <Link
                            href="/admin"
                            onClick={() => setIsMenuOpen(false)}
                            className="px-5 py-3 text-center font-black rounded-xl transition-all shadow-lg bg-primary text-primary-foreground shadow-primary/25 hover:opacity-90 active:scale-95 block"
                        >
                            Panel Admin
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
