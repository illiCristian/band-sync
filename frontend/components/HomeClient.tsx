"use client";

import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import SongAccordion from '@/components/SongAccordion';
import { Song } from '@/types';
import { Layers } from 'lucide-react';

interface HomeClientProps {
    initialSongs: Song[];
}

export default function HomeClient({ initialSongs }: HomeClientProps) {
    const [songs] = useState<Song[]>(initialSongs);

    return (
        <div className="min-h-screen bg-transparent transition-colors">
            <NavBar />

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <header className="mb-12 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs mb-2">
                            <Layers size={14} />
                            <span>Espacio de Trabajo</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                            Repertorio
                        </h1>
                        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                            Gestiona tus ensayos, tomas de estudio y mezclas en un solo lugar.
                        </p>
                    </div>
                </header>

                {/* Library List */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                            Producciones Activas • {songs.length}
                        </h2>
                    </div>

                    {songs.length > 0 ? (
                        songs.map((song) => (
                            <SongAccordion key={song.id} song={song} />
                        ))
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                            <p className="text-gray-400">No se encontraron canciones en tu repertorio.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
