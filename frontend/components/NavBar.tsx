"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Mic2, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { usePathname } from "next/navigation";

export default function NavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 transition-colors">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white group-hover:scale-110 transition-transform shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Mic2 size={24} />
                    </div>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                        LosMapes
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-8 items-center">
                    <Link
                        href="/"
                        className={`text-sm font-bold transition-colors ${isActive('/') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                    >
                        Inicio
                    </Link>
                    <Link
                        href="/admin"
                        className={`transition-all active:scale-95 ${isActive('/admin')
                            ? 'px-5 py-2.5 bg-indigo-600 text-white text-sm font-black rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none'
                            : 'text-sm font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                    >
                        Panel Admin
                    </Link>
                    <ThemeToggle />
                </div>

                {/* Mobile Menu Button Container */}
                <div className="flex items-center gap-4 md:hidden">
                    <ThemeToggle />
                    <button
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-200">
                    <Link
                        href="/"
                        onClick={() => setIsMenuOpen(false)}
                        className={`text-lg font-bold transition-colors ${isActive('/') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}
                    >
                        Inicio
                    </Link>
                    <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className={`px-5 py-3 text-center font-black rounded-xl transition-all shadow-lg ${isActive('/admin')
                            ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                    >
                        Panel Admin
                    </Link>
                </div>
            )}
        </nav>
    );
}
