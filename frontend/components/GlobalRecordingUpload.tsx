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
            if (mode === 'NEW') {
                const songRes = await fetch("/api/songs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Upload size={20} className="text-indigo-600" />
                        Subir Audio
                    </h3>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. Song Selection */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">1. Seleccionar Canción</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setMode('EXISTING')}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'EXISTING'
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                        : 'border-gray-100 dark:border-gray-800 hover:border-indigo-300'}`}
                                >
                                    <span className="block font-bold text-gray-900 dark:text-white mb-1">Canción Existente</span>
                                    <span className="text-xs text-gray-500">Añadir al repertorio</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('NEW')}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'NEW'
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                        : 'border-gray-100 dark:border-gray-800 hover:border-indigo-300'}`}
                                >
                                    <span className="block font-bold text-gray-900 dark:text-white mb-1">Crear Nueva</span>
                                    <span className="text-xs text-gray-500">Empezar de cero</span>
                                </button>
                            </div>

                            {mode === 'EXISTING' ? (
                                <select
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
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
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
                                    value={newSongTitle}
                                    onChange={(e) => setNewSongTitle(e.target.value)}
                                    required={mode === 'NEW'}
                                />
                            )}
                        </div>

                        {/* 2. Recording Details */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">2. Detalles de la Grabación</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Nombre de Versión (ej. Demo Bajo)"
                                    value={versionName}
                                    onChange={(e) => setVersionName(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as RecordingCategory)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
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
                            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all group ${file ? 'border-green-500 bg-green-50/10' : 'border-gray-200 dark:border-gray-700'
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
                                    <CheckCircle2 size={48} className="text-green-500 animate-in zoom-in duration-300" />
                                    <div>
                                        <p className="font-black text-gray-900 dark:text-white text-lg">{file.name}</p>
                                        <p className="text-sm text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • Listo para subir</p>
                                        {originalDuration > 0 && <p className="text-xs text-indigo-500 font-bold mt-1">Duración: {formatSecondsToTime(originalDuration)}</p>}
                                    </div>

                                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm text-left">
                                        <div className="flex items-center gap-2 mb-3">
                                            <input
                                                type="checkbox"
                                                id="trim-toggle"
                                                checked={isTrimming}
                                                onChange={(e) => setIsTrimming(e.target.checked)}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                            <label htmlFor="trim-toggle" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">Recortar Audio</label>
                                        </div>

                                        {isTrimming && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 font-bold">Inicio (min:seg)</label>
                                                    <input
                                                        type="text"
                                                        value={trimStart}
                                                        onChange={(e) => setTrimStart(e.target.value)}
                                                        placeholder="00:00"
                                                        className="w-full p-2 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 font-bold">Fin (min:seg)</label>
                                                    <input
                                                        type="text"
                                                        value={trimEnd}
                                                        onChange={(e) => setTrimEnd(e.target.value)}
                                                        placeholder="01:30"
                                                        className="w-full p-2 bg-gray-50 dark:bg-gray-900 border rounded-lg text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => { setFile(null); setIsTrimming(false); }}
                                        className="mt-2 text-xs font-bold text-red-500 hover:text-red-600 underline underline-offset-4"
                                    >
                                        Cambiar archivo
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                                        <Music size={32} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 dark:text-white text-xl">Subir Grabación</p>
                                        <p className="text-sm text-gray-500">Archivos MP3, WAV o AAC</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('global-file-upload-input')?.click()}
                                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
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
                                className="px-6 py-3 font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!file || isUploading || (mode === 'EXISTING' && !selectedSongId) || (mode === 'NEW' && !newSongTitle)}
                                className={`px-8 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 ${(!file || isUploading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 hover:scale-105 active:scale-95'
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
