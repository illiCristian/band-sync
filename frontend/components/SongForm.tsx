"use client";

import React, { useState, FormEvent } from "react";
import { Song, SongStatus } from "@/types";
import { PlusCircle, Music, Tag } from "lucide-react";

interface SongFormProps {
    onSubmit: (song: Partial<Song>) => Promise<void>;
    initialData?: Partial<Song>;
}

export default function SongForm({ onSubmit, initialData = {} }: SongFormProps) {
    const [title, setTitle] = useState(initialData.title || "");
    const [status, setStatus] = useState<SongStatus>(initialData.status || "IDEA");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const song: Partial<Song> = { title, status };
        await onSubmit(song);
        setTitle("");
        setStatus("IDEA");
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-indigo-500/5 mb-10 transition-all">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                    <PlusCircle size={24} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Create New Song</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 px-1">
                        <Music size={14} />
                        Song Title
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Intención Constante"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 px-1">
                        <Tag size={14} />
                        Current Status
                    </label>
                    <div className="relative">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as SongStatus)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none font-medium"
                        >
                            <option value="IDEA">💡 Idea / WIP</option>
                            <option value="RECORDED">🎙️ Recorded</option>
                            <option value="PUBLISHED">🚀 Published</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <Music size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting || !title}
                className={`mt-10 px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 ${(isSubmitting || !title) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 hover:scale-105 active:scale-95'
                    }`}
            >
                {isSubmitting ? 'Saving...' : 'Register Song'}
            </button>
        </form>
    );
}
