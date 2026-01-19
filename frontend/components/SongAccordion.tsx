"use client";

import React, { useState } from "react";
import { Song, Recording } from "@/types";
import { ChevronDown, ChevronUp, Music, Calendar, Star, Play, Mic2, MoreHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import FormattedDate from "./FormattedDate";
import CommentSection from "./CommentSection";

const AudioPlayer = dynamic(() => import("@/components/AudioPlayer"), { ssr: false });

interface SongAccordionProps {
    song: Song;
}

export default function SongAccordion({ song }: SongAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
        song.recordings?.[0] || null
    );
    const [currentTime, setCurrentTime] = useState(0);
    const [recordings, setRecordings] = useState<Recording[]>(song.recordings || []);

    // Sync selectedRecording and fetch fresh data when opened
    React.useEffect(() => {
        if (isOpen) {
            handleCommentAdded();
        }
    }, [isOpen]);

    React.useEffect(() => {
        if (selectedRecording) {
            const updatedRec = recordings.find(r => r.id === selectedRecording.id);
            if (updatedRec) setSelectedRecording(updatedRec);
        }
    }, [recordings]);

    const handleCommentAdded = async () => {
        if (!selectedRecording) return;

        try {
            // Fetch updated song or recordings to get the new comment
            // We use /api because of the rewrite in next.config.ts
            const res = await fetch(`/api/songs/${song.id}`);
            if (res.ok) {
                const updatedSong: Song = await res.json();
                setRecordings(updatedSong.recordings || []);
                // The useEffect above will sync selectedRecording
            }
        } catch (error) {
            console.error("Error refreshing comments:", error);
        }
    };

    return (
        <div className="w-full mb-4 border border-border rounded-xl overflow-hidden bg-card/80 backdrop-blur-md transition-all hover:shadow-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls={`song-content-${song.id}`}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Music size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-card-foreground">{song.title}</h3>
                        <p className="text-sm font-medium text-muted-foreground">
                            {song.recordings?.length || 0} grabaciones disponibles
                        </p>
                    </div>
                </div>
                <div className="text-muted-foreground">
                    {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>
            </button>

            {isOpen && (
                <div id={`song-content-${song.id}`} className="border-t border-border">
                    {song.recordings && song.recordings.length > 0 && selectedRecording ? (
                        <>
                            {/* Active Player */}
                            <div className="p-5 bg-gradient-to-br from-indigo-600 to-violet-900 text-white shadow-inner">
                                <div className="w-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            {/* Increased legibility with explicit white text and shadows */}
                                            <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-1">
                                                Reproduciendo
                                            </p>
                                            <h3 className="text-2xl font-black text-white drop-shadow-md">
                                                {selectedRecording.versionName}
                                            </h3>
                                            <p className="text-indigo-100/90 text-sm font-medium mt-1">
                                                {selectedRecording.category === 'REHEARSAL' ? 'Ensayo' :
                                                    selectedRecording.category === 'STUDIO' ? 'Estudio' :
                                                        selectedRecording.category === 'LIVE' ? 'En Vivo' : 'Demo'} • <FormattedDate date={selectedRecording.recordedAt} />
                                            </p>
                                        </div>
                                        {selectedRecording.isFinal && (
                                            <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-full shadow-lg shadow-emerald-900/50 ring-2 ring-white/20">
                                                VERSIÓN FINAL
                                            </span>
                                        )}
                                    </div>

                                    <AudioPlayer
                                        url={selectedRecording.url}
                                        comments={selectedRecording.comments || []}
                                        onTimeUpdate={setCurrentTime}
                                    />
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="bg-card px-4 pb-4">
                                <CommentSection
                                    recordingId={selectedRecording.id}
                                    comments={selectedRecording.comments || []}
                                    currentTime={currentTime}
                                    onCommentAdded={handleCommentAdded}
                                />
                            </div>

                            {/* Recording List */}
                            <div className="p-4 bg-muted/30 border-t border-border">
                                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2 mb-3">
                                    Historial de Versiones
                                </h4>
                                <div className="space-y-2">
                                    {recordings.map((rec) => (
                                        <div
                                            key={rec.id}
                                            onClick={() => setSelectedRecording(rec)}
                                            className={`p-3 rounded-xl cursor-pointer transition-all border transform ${selectedRecording?.id === rec.id
                                                ? 'bg-primary border-primary shadow-lg shadow-primary/25 scale-[1.02]'
                                                : 'bg-card border-border hover:border-primary/50 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${selectedRecording?.id === rec.id
                                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                        }`}>
                                                        {selectedRecording?.id === rec.id ? (
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-primary-foreground/40 rounded-full animate-ping" />
                                                                <Play size={16} className="fill-current relative z-10" />
                                                            </div>
                                                        ) : (
                                                            <Mic2 size={16} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-sm ${selectedRecording?.id === rec.id ? 'text-white' : 'text-foreground'
                                                            }`}>
                                                            {rec.versionName}
                                                        </p>
                                                        <p className={`text-xs ${selectedRecording?.id === rec.id ? 'text-indigo-100' : 'text-muted-foreground'
                                                            }`}>
                                                            {rec.category === 'REHEARSAL' ? 'Ensayo' : rec.category === 'STUDIO' ? 'Estudio' : rec.category === 'LIVE' ? 'En Vivo' : 'Demo'} • <FormattedDate date={rec.recordedAt} />
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {rec.isFinal && (
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${selectedRecording?.id === rec.id
                                                            ? 'bg-green-400 text-green-950'
                                                            : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            Final
                                                        </span>
                                                    )}
                                                    <button aria-label="Más opciones" className={`p-3 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${selectedRecording?.id === rec.id
                                                        ? 'hover:bg-primary-foreground/20 text-primary-foreground'
                                                        : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                                                        }`}>
                                                        <MoreHorizontal size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 flex flex-col items-center justify-center bg-muted/30 border-t border-border transition-colors">
                            <div className="p-4 bg-card rounded-full text-muted-foreground mb-3 shadow-sm">
                                <Mic2 size={24} />
                            </div>
                            <p className="text-foreground font-bold mb-1">Aún no hay grabaciones</p>
                            <p className="text-xs text-muted-foreground max-w-[200px] text-center">
                                Las versiones subidas desde el panel de administrador aparecerán aquí.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
