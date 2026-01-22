"use client";

import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
import SongAccordion from '@/components/SongAccordion';
import { Song } from '@/types';
import { Layers } from 'lucide-react';

interface HomeClientProps {
    initialSongs: Song[];
}

import EmptyState from '@/components/EmptyState';
import Link from 'next/link';

export default function HomeClient({ initialSongs }: HomeClientProps) {
    const [songs] = useState<Song[]>(initialSongs);

    return (
        <div className="min-h-screen bg-transparent transition-colors">
            <NavBar />

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <header className="mb-12 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-2">
                            <Layers size={14} />
                            <span>Espacio de Trabajo</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                            Repertorio
                        </h1>
                        <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
                            Gestiona tu catálogo musical, organiza ensayos y trackea el progreso de grabación.
                        </p>
                    </div>
                </header>

                {/* Library List */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                            Canciones Activas
                        </h2>
                    </div>

                    {songs.length > 0 ? (
                        songs.map((song) => (
                            <SongAccordion key={song.id} song={song} />
                        ))
                    ) : (
                        <EmptyState
                            icon={Layers}
                            title="Tu repertorio está vacío"
                            description="No se encontraron canciones activas en el sistema."
                            action={
                                <Link
                                    href="/admin"
                                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all"
                                >
                                    Gestionar Catálogo
                                </Link>
                            }
                        />
                    )}
                </section>
            </main>
        </div>
    );
}
