"use client";

import React, { useEffect, useState } from "react";
import SongForm from "@/components/SongForm";
import SongList from "@/components/SongList";
import { Song } from "@/types";
import { LayoutDashboard, Music, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import GlobalRecordingUpload from "@/components/GlobalRecordingUpload";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Skeleton from "@/components/Skeleton";
import ConfirmModal from "@/components/ConfirmModal";

export default function AdminPage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [isGlobalUploadOpen, setIsGlobalUploadOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [songToDelete, setSongToDelete] = useState<{ id: string, title: string } | null>(null);
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    const fetchSongs = async () => {
        try {
            const res = await fetch("/api/songs");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setSongs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching songs:", error);
            setSongs([]);
        }
    };

    // Calculate statistics safely
    const totalSongs = songs?.length || 0;
    const totalRecordings = songs?.reduce((acc, s) => acc + (s.recordings?.length || 0), 0) || 0;


    useEffect(() => {
        if (isAuthenticated) {
            fetchSongs();
        }
    }, [isAuthenticated]);

    const handleCreate = async (song: Partial<Song>) => {
        const songData = { ...song, bandId: 'placeholder-band-id' };
        const token = localStorage.getItem('token');
        try {
            const res = await fetch("/api/songs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(songData),
            });
            if (!res.ok) throw new Error("Error creating song");
            fetchSongs();
            toast.success("Canción creada exitosamente");
        } catch (error) {
            toast.error("Error al crear la canción");
        }
    };

    const handleUpdate = async (id: string, song: Partial<Song>) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/songs/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(song),
            });
            if (!res.ok) throw new Error("Error updating song");
            fetchSongs();
            toast.success("Canción actualizada");
        } catch (error) {
            toast.error("Error al actualizar");
        }
    };

    const handleDeleteClick = (id: string, title: string) => {
        setSongToDelete({ id, title });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!songToDelete) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/songs/${songToDelete.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchSongs();
                toast.success("Canción eliminada");
            } else {
                toast.error("Error al eliminar");
            }
        } catch (error) {
            toast.error("Error al eliminar");
        } finally {
            setIsDeleteModalOpen(false);
            setSongToDelete(null);
        }
    };

    const handleAddRecording = async (songId: string, data: any) => {
        console.log("Uploading recording to cloud...", data);

        const formData = new FormData();
        formData.append('songId', songId);
        formData.append('versionName', data.versionName);
        formData.append('category', data.category);
        formData.append('isFinal', String(data.isFinal));
        formData.append('file', data.file);

        const token = localStorage.getItem('token');

        try {
            const res = await fetch("/api/recordings/upload", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });

            if (res.ok) {
                fetchSongs();
                toast.success("Grabación subida exitosamente");
            } else {
                toast.error("Error al subir la grabación");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const handleUpdateRecording = async (id: string, data: any) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/recordings/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Error updating recording");
            fetchSongs();
            toast.success("Versión actualizada");
        } catch (error) {
            toast.error("Error al actualizar la versión");
        }
    };

    const handleDeleteRecording = async (id: string) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/recordings/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Error deleting recording");
            fetchSongs();
            toast.success("Versión eliminada");
        } catch (error) {
            toast.error("Error al eliminar la versión");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent">
                <NavBar />
                <main className="max-w-6xl mx-auto px-6 py-12">
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-64" />
                            </div>
                            <Skeleton className="h-12 w-40 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-24 w-full rounded-2xl" />
                            <Skeleton className="h-24 w-full rounded-2xl" />
                        </div>
                        <Skeleton className="h-[400px] w-full rounded-3xl" />
                    </div>
                </main>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-transparent transition-colors">
            <NavBar />
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Admin Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-2">
                            <LayoutDashboard size={14} />
                            <span>Panel de Control</span>
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight">
                            Gestión de Banda
                        </h1>
                    </div>

                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => setIsGlobalUploadOpen(true)}
                            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <TrendingUp size={20} />
                            Subir Audio
                        </button>

                        <div className="hidden md:flex bg-card p-4 rounded-2xl shadow-sm border border-border items-center gap-3">
                            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Canciones</p>
                                <p className="text-xl font-black text-card-foreground">{totalSongs}</p>
                            </div>
                        </div>
                        <div className="bg-card p-4 rounded-2xl shadow-sm border border-border flex items-center gap-3">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <Music size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Grabaciones</p>
                                <p className="text-xl font-black text-card-foreground">
                                    {totalRecordings}
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
                            <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                                Gestionar Catálogo
                            </h2>
                        </div>
                        <SongList
                            songs={songs}
                            onUpdate={handleUpdate}
                            onDelete={handleDeleteClick}
                            onAddRecording={handleAddRecording}
                            onUpdateRecording={handleUpdateRecording}
                            onDeleteRecording={handleDeleteRecording}
                            onRefresh={fetchSongs}
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

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="¿Eliminar canción?"
                message={`¿Estás seguro de que quieres eliminar "${songToDelete?.title}"? Esta acción borrará permanentemente la canción y todas sus grabaciones.`}
                confirmText="Eliminar permanentemente"
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                variant="danger"
            />
        </div>
    );
}
