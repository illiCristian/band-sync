"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Song } from "@/types";
import { Edit2, Trash2, Plus, Music, ChevronRight, X, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import RecordingUploadForm from "./RecordingUploadForm";
import FormattedDate from "./FormattedDate";
import CommentSection from "./CommentSection";
import ConfirmModal from "./ConfirmModal";

interface SongListProps {
    songs: Song[];
    onUpdate: (id: string, data: Partial<Song>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onAddRecording: (songId: string, data: any) => Promise<void>;
    onUpdateRecording: (id: string, data: any) => Promise<void>;
    onDeleteRecording: (id: string) => Promise<void>;
    onRefresh?: () => void;
}

export default function SongList({ songs, onUpdate, onDelete, onAddRecording, onUpdateRecording, onDeleteRecording, onRefresh }: SongListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploadingToId, setUploadingToId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Song>>({ title: "", status: "IDEA" });
    const [expandedSongId, setExpandedSongId] = useState<string | null>(null);
    const [editingRecordingId, setEditingRecordingId] = useState<string | null>(null);
    const [editRecordingData, setEditRecordingData] = useState<any>({});
    const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState<{ id: string, type: 'SONG' | 'RECORDING', title: string } | null>(null);

    const startEdit = (song: Song) => {
        setEditingId(song.id);
        setEditData({ title: song.title, status: song.status });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const submitEdit = async (e: FormEvent) => {
        e.preventDefault();
        if (editingId) {
            await onUpdate(editingId, editData);
            setEditingId(null);
        }
    };

    const startEditRecording = (recording: any) => {
        setEditingRecordingId(recording.id);
        setEditRecordingData({
            versionName: recording.versionName,
            category: recording.category,
            isFinal: recording.isFinal,
        });
    };

    const submitEditRecording = async (e: FormEvent) => {
        e.preventDefault();
        if (editingRecordingId) {
            await onUpdateRecording(editingRecordingId, editRecordingData);
            setEditingRecordingId(null);
        }
    };

    const confirmDelete = (id: string, type: 'SONG' | 'RECORDING', title: string) => {
        setDeleteConfig({ id, type, title });
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteConfig) return;

        if (deleteConfig.type === 'SONG') {
            await onDelete(deleteConfig.id);
        } else {
            await onDeleteRecording(deleteConfig.id);
        }
        setIsDeleteModalOpen(false);
        setDeleteConfig(null);
    };

    return (
        <div className="grid grid-cols-1 gap-6">
            {songs.length === 0 && (
                <div className="text-center py-16 px-6 bg-card rounded-3xl border border-border flex flex-col items-center">
                    <div className="p-4 bg-primary/10 text-primary rounded-full mb-4">
                        <Music size={32} />
                    </div>
                    <h3 className="text-lg font-black text-card-foreground mb-2">Comienza tu Catálogo</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mb-6">Añade tu primera canción usando el formulario de arriba.</p>
                </div>
            )}
            {songs.map((song) => (
                <div key={song.id} className="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl transition-all overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {editingId === song.id ? (
                            <form onSubmit={submitEdit} className="flex-1 flex flex-wrap gap-3">
                                <input
                                    name="title"
                                    value={editData.title}
                                    onChange={handleChange}
                                    className="flex-1 p-3 bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring text-foreground"
                                    placeholder="Song Title"
                                    required
                                />
                                <select
                                    name="status"
                                    value={editData.status}
                                    onChange={handleChange}
                                    className="p-3 bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring text-foreground"
                                >
                                    <option value="IDEA">Idea</option>
                                    <option value="RECORDED">Recorded</option>
                                    <option value="PUBLISHED">Published</option>
                                </select>
                                <div className="flex gap-2">
                                    <button type="submit" className="px-5 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors">Save</button>
                                    <button type="button" onClick={() => setEditingId(null)} className="px-5 py-3 bg-muted text-muted-foreground font-bold rounded-xl hover:bg-accent transition-colors">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpandedSongId(expandedSongId === song.id ? null : song.id)}>
                                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                        <Music size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-card-foreground tracking-tight flex items-center gap-2">
                                            {song.title}
                                            <ChevronRight size={16} className={`transition-transform duration-200 text-muted-foreground ${expandedSongId === song.id ? 'rotate-90' : ''}`} />
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${song.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                song.status === 'RECORDED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {song.status === 'IDEA' ? 'IDEA' : song.status === 'RECORDED' ? 'GRABADA' : 'PUBLICADA'}
                                            </span>
                                            <span className="text-muted-foreground text-xs font-bold">• {song.recordings?.length || 0} Grabaciones</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setUploadingToId(uploadingToId === song.id ? null : song.id)}
                                        className="flex items-center gap-2 px-4 py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-all active:scale-95 min-h-[44px]"
                                    >
                                        <Plus size={18} />
                                        <span className="hidden sm:inline">Añadir Audio</span>
                                    </button>
                                    <button onClick={() => startEdit(song)} aria-label="Editar canción" className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
                                        <Edit2 size={20} />
                                    </button>
                                    <button onClick={() => confirmDelete(song.id, 'SONG', song.title)} aria-label="Eliminar canción" className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Recordings List */}
                    {expandedSongId === song.id && song.recordings && song.recordings.length > 0 && (
                        <div className="border-t border-border bg-muted/30 p-4 space-y-2">
                            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2 mb-2">Versiones</h4>
                            {song.recordings.map((rec: any) => (
                                <div className="border-t border-border mt-2 pt-2">
                                    <div key={rec.id} className="flex flex-col gap-2 p-3 bg-card rounded-xl border border-border">
                                        <div className="flex items-center justify-between">
                                            {editingRecordingId === rec.id ? (
                                                <form onSubmit={submitEditRecording} className="flex-1 flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        value={editRecordingData.versionName}
                                                        onChange={(e) => setEditRecordingData({ ...editRecordingData, versionName: e.target.value })}
                                                        className="flex-1 p-2 text-sm bg-background border border-input rounded-lg text-foreground outline-none focus:ring-2 focus:ring-ring"
                                                    />
                                                    <select
                                                        value={editRecordingData.category}
                                                        onChange={(e) => setEditRecordingData({ ...editRecordingData, category: e.target.value })}
                                                        className="p-2 text-sm bg-background border border-input rounded-lg text-foreground outline-none focus:ring-2 focus:ring-ring"
                                                    >
                                                        <option value="REHEARSAL">Ensayo</option>
                                                        <option value="STUDIO">Estudio</option>
                                                        <option value="LIVE">En Vivo</option>
                                                        <option value="DEMO">Demo</option>
                                                    </select>
                                                    <button type="submit" className="p-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500/20"><Edit2 size={16} /></button>
                                                    <button type="button" onClick={() => setEditingRecordingId(null)} className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent"><X size={16} /></button>
                                                </form>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                            {rec.category.substring(0, 1)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-card-foreground">{rec.versionName}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                <FormattedDate date={rec.recordedAt} />
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setExpandedCommentsId(expandedCommentsId === rec.id ? null : rec.id)}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${expandedCommentsId === rec.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                                                        >
                                                            <MessageSquare size={14} />
                                                            <span>{rec.comments?.length || 0}</span>
                                                            {expandedCommentsId === rec.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        </button>
                                                        <button onClick={() => startEditRecording(rec)} aria-label="Editar grabación" className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => confirmDelete(rec.id, 'RECORDING', rec.versionName)} aria-label="Eliminar grabación" className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {expandedCommentsId === rec.id && (
                                            <div className="mt-2 border-t border-border pt-4 bg-muted/20 rounded-lg p-2 animate-in slide-in-from-top-2">
                                                <CommentSection
                                                    recordingId={rec.id}
                                                    comments={rec.comments || []}
                                                    currentTime={0}
                                                    onCommentAdded={() => onRefresh?.()}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {uploadingToId === song.id && (
                        <div className="p-6 border-t border-border bg-muted/20">
                            <RecordingUploadForm
                                songId={song.id}
                                onUpload={async (data) => {
                                    await onAddRecording(song.id, data);
                                    setUploadingToId(null);
                                }}
                                onCancel={() => setUploadingToId(null)}
                            />
                        </div>
                    )}
                </div>
            ))}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title={deleteConfig?.type === 'SONG' ? "¿Eliminar canción?" : "¿Eliminar grabación?"}
                message={`¿Estás seguro de que quieres eliminar "${deleteConfig?.title}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                variant="danger"
            />
        </div>
    );
}

