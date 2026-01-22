"use client";

import React, { useState } from "react";
import { Song, RecordingCategory } from "@/types";
import { Upload, X, CheckCircle2, Clock, Plus, Music } from "lucide-react";

interface GlobalRecordingUploadProps {
    songs: Song[];
    onUploadComplete: () => void;
    onCancel: () => void;
}

import { trimAudioFile, formatSecondsToTime, parseTimeToSeconds } from "@/utils/audio";

export default function GlobalRecordingUpload({ songs, onUploadComplete, onCancel }: GlobalRecordingUploadProps) {
    const [mode, setMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
    const [selectedSongId, setSelectedSongId] = useState<string>("");
    const [newSongTitle, setNewSongTitle] = useState("");

    // Recording Fields
    const [versionName, setVersionName] = useState("");
    const [category, setCategory] = useState<RecordingCategory>("REHEARSAL");
    const [isFinal, setIsFinal] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Trimming Fields
    const [isTrimming, setIsTrimming] = useState(false);
    const [trimStart, setTrimStart] = useState<string>("00:00");
    const [trimEnd, setTrimEnd] = useState<string>("");
    const [originalDuration, setOriginalDuration] = useState<number>(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Load audio to get duration
            const audio = new Audio(URL.createObjectURL(selectedFile));
            audio.onloadedmetadata = () => {
                setOriginalDuration(audio.duration);
                setTrimEnd(formatSecondsToTime(audio.duration));
            };
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        try {
            let finalFile = file;

            // Trim Logic
            if (isTrimming) {
                const start = parseTimeToSeconds(trimStart);
                const end = parseTimeToSeconds(trimEnd);
                if (!isNaN(start) && !isNaN(end) && end > start) {
                    finalFile = await trimAudioFile(file, start, end);
                }
            }

            let targetSongId = selectedSongId;

            // 1. If creating a new song, create it first
            const token = localStorage.getItem('token');

            if (mode === 'NEW') {
                const songRes = await fetch("/api/songs", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ title: newSongTitle, status: 'IDEA', bandId: 'default' }),
                });
                if (!songRes.ok) throw new Error("Error al crear la canción");
                const newSong = await songRes.json();
                targetSongId = newSong.id;
            }

            if (!targetSongId) throw new Error("Ninguna canción seleccionada");

            // 2. Upload the recording
            const formData = new FormData();
            formData.append('songId', targetSongId);
            formData.append('versionName', versionName || "Toma 1");
            formData.append('category', category);
            formData.append('isFinal', String(isFinal));
            formData.append('file', finalFile);

            const res = await fetch("/api/recordings/upload", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });

            if (!res.ok) throw new Error("Error en la subida");

            onUploadComplete();
        } catch (error) {
            console.error(error);
            alert("Error: " + (error as any).message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                        <Upload size={20} className="text-primary" />
                        Subir Audio
                    </h3>
                    <button onClick={onCancel} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={20} className="text-muted-foreground hover:text-foreground" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. Song Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">1. Seleccionar Canción</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setMode('EXISTING')}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'EXISTING'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-input'}`}
                                >
                                    <span className="block font-bold text-foreground mb-1">Canción Existente</span>
                                    <span className="text-xs text-muted-foreground">Añadir al repertorio</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('NEW')}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'NEW'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-input'}`}
                                >
                                    <span className="block font-bold text-foreground mb-1">Crear Nueva</span>
                                    <span className="text-xs text-muted-foreground">Empezar de cero</span>
                                </button>
                            </div>

                            {mode === 'EXISTING' ? (
                                <select
                                    className="w-full p-4 bg-input border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                                    value={selectedSongId}
                                    onChange={(e) => setSelectedSongId(e.target.value)}
                                    required={mode === 'EXISTING'}
                                >
                                    <option value="">-- Elige una canción --</option>
                                    {songs.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="Título de la canción..."
                                    className="w-full p-4 bg-input border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary font-bold text-lg text-foreground"
                                    value={newSongTitle}
                                    onChange={(e) => setNewSongTitle(e.target.value)}
                                    required={mode === 'NEW'}
                                />
                            )}
                        </div>

                        {/* 2. Recording Details */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">2. Detalles de la Grabación</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Nombre de Versión (ej. Demo Bajo)"
                                    value={versionName}
                                    onChange={(e) => setVersionName(e.target.value)}
                                    className="w-full p-3 bg-input border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary text-foreground"
                                    required
                                />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as RecordingCategory)}
                                    className="w-full p-3 bg-input border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary text-foreground"
                                >
                                    <option value="REHEARSAL">Ensayo</option>
                                    <option value="STUDIO">Estudio</option>
                                    <option value="LIVE">En Vivo</option>
                                    <option value="DEMO">Demo</option>
                                </select>
                            </div>
                        </div>

                        {/* 3. File Upload & Trimming */}
                        <div
                            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all group ${file ? 'border-success bg-success/5' : 'border-border'
                                }`}
                        >
                            <input
                                id="global-file-upload-input"
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {file ? (
                                <div className="flex flex-col items-center gap-3">
                                    <CheckCircle2 size={48} className="text-success animate-in zoom-in duration-300" />
                                    <div>
                                        <p className="font-black text-foreground text-lg">{file.name}</p>
                                        <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB • Listo para subir</p>
                                        {originalDuration > 0 && <p className="text-xs text-primary font-bold mt-1">Duración: {formatSecondsToTime(originalDuration)}</p>}
                                    </div>

                                    <div className="mt-4 p-4 bg-card rounded-xl border border-border w-full max-w-sm text-left">
                                        <div className="flex items-center gap-2 mb-3">
                                            <input
                                                type="checkbox"
                                                id="trim-toggle"
                                                checked={isTrimming}
                                                onChange={(e) => setIsTrimming(e.target.checked)}
                                                className="w-4 h-4 text-primary rounded focus:ring-primary"
                                            />
                                            <label htmlFor="trim-toggle" className="text-sm font-bold text-foreground cursor-pointer">Recortar Audio</label>
                                        </div>

                                        {isTrimming && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-muted-foreground font-bold">Inicio (min:seg)</label>
                                                    <input
                                                        type="text"
                                                        value={trimStart}
                                                        onChange={(e) => setTrimStart(e.target.value)}
                                                        placeholder="00:00"
                                                        className="w-full p-2 bg-input border rounded-lg text-sm text-foreground"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground font-bold">Fin (min:seg)</label>
                                                    <input
                                                        type="text"
                                                        value={trimEnd}
                                                        onChange={(e) => setTrimEnd(e.target.value)}
                                                        placeholder="01:30"
                                                        className="w-full p-2 bg-input border rounded-lg text-sm text-foreground"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => { setFile(null); setIsTrimming(false); }}
                                        className="mt-2 text-xs font-bold text-destructive hover:text-destructive/90 underline underline-offset-4"
                                    >
                                        Cambiar archivo
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-5 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-300">
                                        <Music size={32} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-black text-foreground text-xl">Subir Grabación</p>
                                        <p className="text-sm text-muted-foreground">Archivos MP3, WAV o AAC</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('global-file-upload-input')?.click()}
                                        className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-primary/25 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Seleccionar Archivo
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-3 font-bold text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!file || isUploading || (mode === 'EXISTING' && !selectedSongId) || (mode === 'NEW' && !newSongTitle)}
                                className={`px-8 py-3 bg-primary text-primary-foreground font-black rounded-xl shadow-xl shadow-primary/25 transition-all flex items-center gap-2 ${(!file || isUploading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90 hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isUploading ? (
                                    <>
                                        <Clock size={18} className="animate-spin" />
                                        Subiendo{isTrimming ? ' y procesando...' : '...'}
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Subir Ahora
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
