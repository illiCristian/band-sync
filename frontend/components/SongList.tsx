"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Song } from "@/types";
import { Edit2, Trash2, Plus, Music, ChevronRight, X } from "lucide-react";
import RecordingUploadForm from "./RecordingUploadForm";

interface SongListProps {
    songs: Song[];
    onUpdate: (id: string, data: Partial<Song>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onAddRecording: (songId: string, data: any) => Promise<void>;
    onUpdateRecording: (id: string, data: any) => Promise<void>;
    onDeleteRecording: (id: string) => Promise<void>;
}

export default function SongList({ songs, onUpdate, onDelete, onAddRecording, onUpdateRecording, onDeleteRecording }: SongListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploadingToId, setUploadingToId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Song>>({ title: "", status: "IDEA" });
    const [expandedSongId, setExpandedSongId] = useState<string | null>(null);
    const [editingRecordingId, setEditingRecordingId] = useState<string | null>(null);
    const [editRecordingData, setEditRecordingData] = useState<any>({});

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

    return (
        <div className="grid grid-cols-1 gap-6">
            {songs.map((song) => (
                <div key={song.id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all overflow-hidden">
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {editingId === song.id ? (
                            <form onSubmit={submitEdit} className="flex-1 flex flex-wrap gap-3">
                                <input
                                    name="title"
                                    value={editData.title}
                                    onChange={handleChange}
                                    className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Song Title"
                                    required
                                />
                                <select
                                    name="status"
                                    value={editData.status}
                                    onChange={handleChange}
                                    className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="IDEA">Idea</option>
                                    <option value="RECORDED">Recorded</option>
                                    <option value="PUBLISHED">Published</option>
                                </select>
                                <div className="flex gap-2">
                                    <button type="submit" className="px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Save</button>
                                    <button type="button" onClick={() => setEditingId(null)} className="px-5 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpandedSongId(expandedSongId === song.id ? null : song.id)}>
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                                        <Music size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                            {song.title}
                                            <ChevronRight size={16} className={`transition-transform duration-200 ${expandedSongId === song.id ? 'rotate-90' : ''}`} />
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${song.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                                song.status === 'RECORDED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {song.status === 'IDEA' ? 'IDEA' : song.status === 'RECORDED' ? 'GRABADA' : 'PUBLICADA'}
                                            </span>
                                            <span className="text-gray-400 text-xs font-bold">• {song.recordings?.length || 0} Grabaciones</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setUploadingToId(uploadingToId === song.id ? null : song.id)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95"
                                    >
                                        <Plus size={18} />
                                        <span className="hidden sm:inline">Añadir Audio</span>
                                    </button>
                                    <button onClick={() => startEdit(song)} className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
                                        <Edit2 size={20} />
                                    </button>
                                    <button onClick={() => { if (window.confirm('¿Estás seguro de que quieres eliminar esta canción?')) onDelete(song.id); }} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Recordings List */}
                    {expandedSongId === song.id && song.recordings && song.recordings.length > 0 && (
                        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 p-4 space-y-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Versiones</h4>
                            {song.recordings.map((rec: any) => (
                                <div key={rec.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                    {editingRecordingId === rec.id ? (
                                        <form onSubmit={submitEditRecording} className="flex-1 flex gap-2 items-center">
                                            <input
                                                type="text"
                                                value={editRecordingData.versionName}
                                                onChange={(e) => setEditRecordingData({ ...editRecordingData, versionName: e.target.value })}
                                                className="flex-1 p-2 text-sm bg-gray-50 dark:bg-gray-900 border rounded-lg"
                                            />
                                            <select
                                                value={editRecordingData.category}
                                                onChange={(e) => setEditRecordingData({ ...editRecordingData, category: e.target.value })}
                                                className="p-2 text-sm bg-gray-50 dark:bg-gray-900 border rounded-lg"
                                            >
                                                <option value="REHEARSAL">Ensayo</option>
                                                <option value="STUDIO">Estudio</option>
                                                <option value="LIVE">En Vivo</option>
                                                <option value="DEMO">Demo</option>
                                            </select>
                                            <button type="submit" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Edit2 size={16} /></button>
                                            <button type="button" onClick={() => setEditingRecordingId(null)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"><X size={16} /></button>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                                    {rec.category.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{rec.versionName}</p>
                                                    <p className="text-xs text-gray-500" suppressHydrationWarning>{new Date(rec.recordedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => startEditRecording(rec)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => { if (window.confirm('¿Estás seguro de que quieres eliminar esta grabación?')) onDeleteRecording(rec.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {uploadingToId === song.id && (
                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/20">
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
        </div>
    );
}

