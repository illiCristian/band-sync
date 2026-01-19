"use client";

import React, { useState } from "react";
import { Song, Recording } from "@/types";
import { ChevronDown, ChevronUp, Music, Calendar, Star, Play, Mic2, MoreHorizontal } from "lucide-react";
import dynamic from "next/dynamic";

const AudioPlayer = dynamic(() => import("@/components/AudioPlayer"), { ssr: false });

interface SongAccordionProps {
    song: Song;
}

export default function SongAccordion({ song }: SongAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
        song.recordings?.[0] || null
    );

    return (
        <div className="w-full mb-4 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-md transition-all hover:shadow-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Music size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{song.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {song.recordings?.length || 0} grabaciones disponibles
                        </p>
                    </div>
                </div>
                <div className="text-gray-400">
                    {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>
            </button>

            {isOpen && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                    {song.recordings && song.recordings.length > 0 && selectedRecording ? (
                        <>
                            {/* Active Player */}
                            <div className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
                                <div className="w-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Reproduciendo</p>
                                            <h3 className="text-xl font-black text-white">{selectedRecording.versionName}</h3>
                                            <p className="text-white/60 text-sm">
                                                {selectedRecording.category === 'REHEARSAL' ? 'Ensayo' :
                                                    selectedRecording.category === 'STUDIO' ? 'Estudio' :
                                                        selectedRecording.category === 'LIVE' ? 'En Vivo' : 'Demo'} • {new Date(selectedRecording.recordedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {selectedRecording.isFinal && (
                                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg shadow-green-900/20">
                                                VERSIÓN FINAL
                                            </span>
                                        )}
                                    </div>

                                    <AudioPlayer
                                        url={selectedRecording.url}
                                        comments={selectedRecording.comments}
                                    />
                                </div>
                            </div>

                            {/* Recording List */}
                            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">
                                    Historial de Versiones
                                </h4>
                                <div className="space-y-2">
                                    {song.recordings.map((rec) => (
                                        <div
                                            key={rec.id}
                                            onClick={() => setSelectedRecording(rec)}
                                            className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedRecording?.id === rec.id
                                                ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-none'
                                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${selectedRecording?.id === rec.id
                                                        ? 'bg-white/20 text-white'
                                                        : rec.isFinal ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                                        }`}>
                                                        {selectedRecording?.id === rec.id ? (
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-white/40 rounded-full animate-ping" />
                                                                <Play size={16} className="fill-current relative z-10" />
                                                            </div>
                                                        ) : (
                                                            <Mic2 size={16} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-sm ${selectedRecording?.id === rec.id ? 'text-white' : 'text-gray-900 dark:text-white'
                                                            }`}>
                                                            {rec.versionName}
                                                        </p>
                                                        <p className={`text-xs ${selectedRecording?.id === rec.id ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                                                            }`} suppressHydrationWarning>
                                                            {rec.category === 'REHEARSAL' ? 'Ensayo' : rec.category === 'STUDIO' ? 'Estudio' : rec.category === 'LIVE' ? 'En Vivo' : 'Demo'} • {new Date(rec.recordedAt).toLocaleDateString()}
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
                                                    <button className={`p-2 rounded-full transition-colors ${selectedRecording?.id === rec.id
                                                        ? 'hover:bg-white/20 text-white'
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
                                                        }`}>
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 transition-colors">
                            <div className="inline-flex p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 mb-3">
                                <Mic2 size={24} />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No hay grabaciones disponibles</p>
                            <p className="text-xs text-gray-400 mt-1">Sube la primera versión en el panel de admin</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
