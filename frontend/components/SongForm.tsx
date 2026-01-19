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
        <form onSubmit={handleSubmit} className="bg-card p-8 rounded-3xl border border-border shadow-xl shadow-primary/5 mb-10 transition-all">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg shadow-primary/25">
                    <PlusCircle size={24} />
                </div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Nueva Canción</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                        <Music size={14} />
                        Título
                    </label>
                    <input
                        type="text"
                        placeholder="ej. Intención Constante"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-4 bg-background/50 border border-input rounded-2xl focus:ring-4 focus:ring-ring/10 focus:border-ring transition-all outline-none font-medium text-foreground placeholder:text-muted-foreground"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                        <Tag size={14} />
                        Estado Actual
                    </label>
                    <div className="relative">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as SongStatus)}
                            className="w-full p-4 bg-background/50 border border-input rounded-2xl focus:ring-4 focus:ring-ring/10 focus:border-ring transition-all outline-none appearance-none font-medium text-foreground"
                        >
                            <option value="IDEA">💡 Idea / WIP</option>
                            <option value="RECORDED">🎙️ Grabada</option>
                            <option value="PUBLISHED">🚀 Publicada</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <Tag size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting || !title}
                className={`mt-10 px-10 py-4 bg-primary text-primary-foreground font-black rounded-2xl shadow-lg shadow-primary/25 transition-all flex items-center gap-2 ${(isSubmitting || !title) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
            >
                {isSubmitting ? (
                    <>
                        <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                        <span>Guardando...</span>
                    </>
                ) : (
                    <>
                        <PlusCircle size={20} />
                        <span>Registrar Canción</span>
                    </>
                )}
            </button>
        </form>
    );
}
