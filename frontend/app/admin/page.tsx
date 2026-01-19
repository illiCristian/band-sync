"use client";

import React, { useEffect, useState } from "react";
import SongForm from "@/components/SongForm";
import SongList from "@/components/SongList";
import { Song } from "@/types";
import { LayoutDashboard, Music, TrendingUp } from "lucide-react";
import GlobalRecordingUpload from "@/components/GlobalRecordingUpload";
import NavBar from "@/components/NavBar";

export default function AdminPage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [isGlobalUploadOpen, setIsGlobalUploadOpen] = useState(false);

    const fetchSongs = async () => {
        const res = await fetch("/api/songs");
        const data = await res.json();
        setSongs(data);
    };

    useEffect(() => {
        fetchSongs();
    }, []);

    const handleCreate = async (song: Partial<Song>) => {
        const songData = { ...song, bandId: 'placeholder-band-id' };
        await fetch("/api/songs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(songData),
        });
        fetchSongs();
    };

    const handleUpdate = async (id: string, song: Partial<Song>) => {
        await fetch(`/api/songs/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(song),
        });
        fetchSongs();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this song and all its recordings?")) {
            await fetch(`/api/songs/${id}`, { method: "DELETE" });
            fetchSongs();
        }
    };

    const handleAddRecording = async (songId: string, data: any) => {
        console.log("Uploading recording to cloud...", data);

        // In a real scenario, we would use FormData
        const formData = new FormData();
        formData.append('songId', songId);
        formData.append('versionName', data.versionName);
        formData.append('category', data.category);
        formData.append('isFinal', String(data.isFinal));
        formData.append('file', data.file);

        const res = await fetch("/api/recordings/upload", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            fetchSongs();
        } else {
            alert("Failed to upload recording. Please check your connection.");
        }
    };

    const handleUpdateRecording = async (id: string, data: any) => {
        await fetch(`/api/recordings/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        fetchSongs();
    };

    const handleDeleteRecording = async (id: string) => {
        if (confirm("Are you sure you want to delete this version?")) {
            await fetch(`/api/recordings/${id}`, { method: "DELETE" });
            fetchSongs();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <NavBar />
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Admin Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs mb-2">
                            <LayoutDashboard size={14} />
                            <span>Panel de Control</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                            Gestión de Banda
                        </h1>
                    </div>

                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => setIsGlobalUploadOpen(true)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 active:scale-95"
                        >
                            <TrendingUp size={20} />
                            Subir Audio
                        </button>

                        <div className="hidden md:flex bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 items-center gap-3">
                            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Canciones</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white">{songs.length}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                                <Music size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Grabaciones</p>
                                <p className="text-xl font-black text-gray-900 dark:text-white">
                                    {songs.reduce((acc, s) => acc + (s.recordings?.length || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-10">
                    <section>
                        <SongForm onSubmit={handleCreate} />
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                                Gestionar Catálogo
                            </h2>
                        </div>
                        <SongList
                            songs={songs}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                            onAddRecording={handleAddRecording}
                            onUpdateRecording={handleUpdateRecording}
                            onDeleteRecording={handleDeleteRecording}
                        />
                    </section>
                </div>
            </main>

            {isGlobalUploadOpen && (
                <GlobalRecordingUpload
                    songs={songs}
                    onUploadComplete={() => {
                        setIsGlobalUploadOpen(false);
                        fetchSongs();
                    }}
                    onCancel={() => setIsGlobalUploadOpen(false)}
                />
            )}
        </div>
    );
}
